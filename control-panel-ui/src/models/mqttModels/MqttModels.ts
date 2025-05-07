export enum CommandType {
    Initialize = "Initialize",
    Move = "move",
    Stop = "stop"
}

export enum ClientCommandType{
    Initialized="Initialized",
    BatteryStatus ="batteryStatus"
}



export enum Direction {
    FORWARD="w",
    BACKWARD="s",
    LEFT="l",
    RIGHT="r"
}

export interface Command<TPayload = any> {
    commandType: CommandType;
    payload?: TPayload;
}

export interface ClientCommand<TPayload = any> {
    command: ClientCommandType;
    payload?: TPayload;
}

export interface Robot {
    engine:boolean
    initialize:boolean,
    activeMovements:Set<Direction>
}
export interface MovementCommand {
    activeMovements: string[]
    lastCommand:string
}

export interface InitializeEngineResponse {
    initializeEngine:boolean;
    ErrorMessage:string;
}

export interface NegativeDistanceWarning{
    warning:string
}



