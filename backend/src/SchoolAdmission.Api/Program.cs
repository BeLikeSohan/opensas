using System.Text.Json.Serialization;
using SchoolAdmission.Api.ExceptionHandling;
using SchoolAdmission.Application;
using SchoolAdmission.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddExceptionHandler<DuplicateClassExceptionHandler>();
builder.Services.AddExceptionHandler<ClassNotFoundExceptionHandler>();
builder.Services.AddExceptionHandler<NoSeatsAvailableExceptionHandler>();
builder.Services.AddExceptionHandler<ActiveHoldExistsExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
