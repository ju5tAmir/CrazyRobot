export interface ServoCommand {
  CommandType: string;
  Payload: {
    Servos: {
      head: number;
    };
  };
}
