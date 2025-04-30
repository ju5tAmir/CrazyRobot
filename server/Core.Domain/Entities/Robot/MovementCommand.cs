namespace Core.Domain.Entities.Robot;

public class MovementCommand
{
    public Directions Directions { get; set; }
}

public class Directions
{
    public List<string> ActiveMovements { get; set; }
    public string LastCommand { get; set; }
}