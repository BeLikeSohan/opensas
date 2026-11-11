using System.Net;
using System.Net.Http.Json;
using SchoolAdmission.Api.Contracts.Classes;
using SchoolAdmission.Tests.Infrastructure;

namespace SchoolAdmission.Tests.Classes;

[Collection(ApiCollection.Name)]
public sealed class ClassCreationTests(ApiFactory factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Parallel_creates_with_the_same_name_create_only_one_class()
    {
        var name = $"Physics {Guid.NewGuid()}";

        // Release every request at once so they race on the unique index rather than queueing.
        var gate = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var tasks = Enumerable.Range(0, 10).Select(async _ =>
        {
            await gate.Task;
            return await _client.PostAsJsonAsync("/classes", new CreateClassRequest(name, 30));
        }).ToList();
        gate.SetResult();
        var responses = await Task.WhenAll(tasks);

        Assert.Single(responses, r => r.StatusCode == HttpStatusCode.Created);
        Assert.Equal(9, responses.Count(r => r.StatusCode == HttpStatusCode.Conflict));

        var classes = await _client.GetFromJsonAsync<List<ClassSummaryResponse>>("/classes");
        Assert.Single(classes!, c => c.Name == name);
    }

    [Fact]
    public async Task Class_names_are_unique_regardless_of_case()
    {
        var name = $"Biology {Guid.NewGuid()}";
        var first = await _client.PostAsJsonAsync("/classes", new CreateClassRequest(name, 30));
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);

        var duplicate = await _client.PostAsJsonAsync(
            "/classes", new CreateClassRequest(name.ToUpperInvariant(), 30));

        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
    }
}
