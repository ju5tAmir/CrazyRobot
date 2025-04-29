export enum CommandType {
    Initialize = "initialize",
    Move = "move",
    Stop = "stop"
}

export enum ClientCommandType{
    Initialized="Initialized",
    BatteryStatus ="batteryStatus"
}



export enum Direction {
    FORWARD="forward",
    BACKWARD="backward",
    LEFT="left",
    RIGHT="right"
}

export interface Command<TPayload = any> {
    command: CommandType;
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
    activeMovements: Set<Direction>;
    speed: number;
}

export interface EngineManagement  {
    engine:boolean
}
export interface InitializeEngineResponse {
    initializeEngine:boolean;
}



