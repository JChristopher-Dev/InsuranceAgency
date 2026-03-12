namespace InsuranceAgency.Domain.Entities;

public class Client
{
    public int ClientID { get; private set; }
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public DateTime DateOfBirth { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string Address { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }

    // Navigation
    public IReadOnlyCollection<Policy> Policies => _policies.AsReadOnly();
    private readonly List<Policy> _policies = new();

    // EF constructor
    protected Client() { }

    public Client(string firstName, string lastName, DateTime dateOfBirth,
                  string email, string phone, string address)
    {
        FirstName    = Guard(firstName,    nameof(firstName));
        LastName     = Guard(lastName,     nameof(lastName));
        Email        = Guard(email,        nameof(email));
        Phone        = Guard(phone,        nameof(phone));
        Address      = Guard(address,      nameof(address));
        DateOfBirth  = dateOfBirth;
        CreatedAt    = DateTime.UtcNow;
    }

    public void Update(string firstName, string lastName, string email,
                       string phone, string address)
    {
        FirstName = Guard(firstName, nameof(firstName));
        LastName  = Guard(lastName,  nameof(lastName));
        Email     = Guard(email,     nameof(email));
        Phone     = Guard(phone,     nameof(phone));
        Address   = Guard(address,   nameof(address));
    }

    public string FullName => $"{FirstName} {LastName}";

    private static string Guard(string value, string name)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException($"{name} cannot be empty.", name);
        return value.Trim();
    }
}
