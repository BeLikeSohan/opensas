public class SchoolClass
{
    public Guid Id {get; set;}
    public string Name { get; set; } = "";
    public string Shift { get; set; } = "";
    public int Capacity { get; set; }
    public DateTime CreatedAt { get; set; }
}