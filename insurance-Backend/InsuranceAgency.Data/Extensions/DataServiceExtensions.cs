using InsuranceAgency.Data.Context;
using InsuranceAgency.Data.Repositories;
using InsuranceAgency.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace InsuranceAgency.Data.Extensions;

public static class DataServiceExtensions
{
    public static IServiceCollection AddDataServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register DbContext pointing to your existing InsuranceDB
        services.AddDbContext<InsuranceDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("InsuranceDB"),
                sql => sql.MigrationsAssembly("InsuranceAgency.Data")
            ));

        // Register repositories
        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<IPolicyRepository, PolicyRepository>();
        services.AddScoped<IClaimRepository,  ClaimRepository>();

        return services;
    }
}
