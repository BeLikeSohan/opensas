using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
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
builder.Services.AddExceptionHandler<HoldNotFoundExceptionHandler>();
builder.Services.AddExceptionHandler<HoldExpiredExceptionHandler>();
builder.Services.AddExceptionHandler<HoldNotConfirmableExceptionHandler>();
builder.Services.AddExceptionHandler<HoldNotCancellableExceptionHandler>();
builder.Services.AddProblemDetails();

const string FrontendCorsPolicy = "Frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Apply pending EF Core migrations so a fresh database gets its schema.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
app.UseExceptionHandler();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// HTTPS Disabled (see ASSUMPTIONS.md)
//app.UseHttpsRedirection();

app.UseCors(FrontendCorsPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();
