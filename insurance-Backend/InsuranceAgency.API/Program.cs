using InsuranceAgency.Data.Extensions;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ── Services ──────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        opts.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddDataServices(builder.Configuration);

// ── Swagger ───────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Insurance Agency API",
        Version = "v1",
        Description = "REST API for managing clients, policies (Life / Funeral / Legal) and claims.",
        Contact = new OpenApiContact
        {
            Name = "Insurance Agency",
            Email = "support@insuranceagency.co.za"
        }
    });
    c.TagActionsBy(api => new[] { api.GroupName ?? api.ActionDescriptor.RouteValues["controller"] });
});

// ── CORS ──────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

// ── Middleware ────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Insurance Agency API v1");
        c.RoutePrefix = string.Empty;
        c.DisplayRequestDuration();
        c.EnableDeepLinking();
    });
}

// Removed UseHttpsRedirection — API runs on plain HTTP locally
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();