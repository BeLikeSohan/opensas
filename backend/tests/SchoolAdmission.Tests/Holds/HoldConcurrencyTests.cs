using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using SchoolAdmission.Api.Contracts.Classes;
using SchoolAdmission.Api.Contracts.Holds;
using SchoolAdmission.Tests.Infrastructure;

namespace SchoolAdmission.Tests.Holds;

/// <summary>
/// Fires simultaneous requests at the API to prove the row lock, guarded updates and unique
/// index hold up under contention. Each test uses its own class and student IDs, so tests
/// don't interfere with each other and the database never needs resetting.
/// </summary>
[Collection(ApiCollection.Name)]
public sealed class HoldConcurrencyTests(ApiFactory factory)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly HttpClient _client = factory.CreateClient();

    [Theory]
    [InlineData(1, 20)]
    [InlineData(5, 40)]
    public async Task Parallel_holds_never_oversell_a_class(int capacity, int students)
    {
        var classId = await CreateClassAsync(capacity);

        var responses = await RunConcurrentlyAsync(
            Enumerable.Range(0, students).Select(_ => NewStudentId()),
            studentId => CreateHoldAsync(classId, studentId));

        Assert.Equal(capacity, responses.Count(r => r.StatusCode == HttpStatusCode.Created));
        Assert.Equal(students - capacity, responses.Count(r => r.StatusCode == HttpStatusCode.Conflict));

        var summary = await _client.GetFromJsonAsync<ClassSummaryResponse>($"/classes/{classId}", Json);
        Assert.Equal(capacity, summary!.HeldSeats);
        Assert.Equal(0, summary.AvailableSeats);
    }

    [Fact]
    public async Task Parallel_holds_by_the_same_student_create_only_one()
    {
        var classId = await CreateClassAsync(capacity: 10);
        var studentId = NewStudentId();

        var responses = await RunConcurrentlyAsync(
            Enumerable.Repeat(studentId, 10),
            id => CreateHoldAsync(classId, id));

        Assert.Single(responses, r => r.StatusCode == HttpStatusCode.Created);
        Assert.Equal(9, responses.Count(r => r.StatusCode == HttpStatusCode.Conflict));

        var summary = await _client.GetFromJsonAsync<ClassSummaryResponse>($"/classes/{classId}", Json);
        Assert.Equal(1, summary!.HeldSeats);
    }

    [Fact]
    public async Task Racing_confirm_and_cancel_leaves_the_hold_in_exactly_one_final_state()
    {
        // Repeat the race a few times: a single run might not interleave.
        for (var round = 0; round < 10; round++)
        {
            var classId = await CreateClassAsync(capacity: 1);
            var studentId = NewStudentId();
            var created = await CreateHoldAsync(classId, studentId);
            var hold = await created.Content.ReadFromJsonAsync<HoldResponse>(Json);

            var responses = await RunConcurrentlyAsync(
                [true, false],
                confirm => SendAsStudent(
                    confirm ? HttpMethod.Post : HttpMethod.Delete,
                    confirm ? $"/holds/{hold!.HoldId}/confirm" : $"/holds/{hold!.HoldId}",
                    studentId));

            var confirm = responses[0];
            var cancel = responses[1];
            var details = await _client.GetFromJsonAsync<HoldDetailsResponse>($"/holds/{hold!.HoldId}", Json);

            // Exactly one side wins; the loser gets 409 and the stored status matches the winner.
            if (confirm.StatusCode == HttpStatusCode.OK)
            {
                Assert.Equal(HttpStatusCode.Conflict, cancel.StatusCode);
                Assert.Equal(HoldStatus.CONFIRMED, details!.Status);
            }
            else
            {
                Assert.Equal(HttpStatusCode.NoContent, cancel.StatusCode);
                Assert.Equal(HttpStatusCode.Conflict, confirm.StatusCode);
                Assert.Equal(HoldStatus.CANCELLED, details!.Status);
            }
        }
    }

    /// <summary>
    /// Starts every request at once, behind a shared gate, so they genuinely contend
    /// instead of trickling in as the loop creates them.
    /// </summary>
    private static async Task<HttpResponseMessage[]> RunConcurrentlyAsync<T>(
        IEnumerable<T> inputs, Func<T, Task<HttpResponseMessage>> send)
    {
        var gate = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var tasks = inputs.Select(async input =>
        {
            await gate.Task;
            return await send(input);
        }).ToList();

        gate.SetResult();
        return await Task.WhenAll(tasks);
    }

    private async Task<Guid> CreateClassAsync(int capacity)
    {
        var response = await _client.PostAsJsonAsync(
            "/classes", new CreateClassRequest($"Class {Guid.NewGuid()}", capacity), Json);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<ClassResponse>(Json))!.Id;
    }

    private Task<HttpResponseMessage> CreateHoldAsync(Guid classId, string studentId) =>
        SendAsStudent(HttpMethod.Post, $"/classes/{classId}/holds", studentId);

    private Task<HttpResponseMessage> SendAsStudent(HttpMethod method, string url, string studentId)
    {
        var request = new HttpRequestMessage(method, url);
        request.Headers.Add("X-Student-Id", studentId);
        return _client.SendAsync(request);
    }

    // 17 random digits, the format the API requires.
    private static string NewStudentId() =>
        Random.Shared.NextInt64(10_000_000_000_000_000, 100_000_000_000_000_000).ToString();
}
