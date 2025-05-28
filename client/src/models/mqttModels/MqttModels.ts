export enum CommandType {
    Initialize = "Initialize",
    Move = "move",
    Stop = "stop",
    Servo = "Servo"
}

export const TERMINATOR:string  = "#";

export enum ClientCommandType {
    Initialized = "Initialized",
    BatteryStatus = "batteryStatus"
}

export enum WARNING_LEVEL {
    MILD = "m", //mild warning
    SEVERE = "s",//severe warning
    FREE = "f"//no obstacles detected
}

export enum DIRECTION_WARNING {
    FRONT = "FT", //front
    BACK = "BK",//back
    LEFT = "LT",//left
    RIGHT = "RT" //right
}



export enum Direction {
    FORWARD = "w",
    BACKWARD = "s",
    LEFT = "l",
    RIGHT = "r"
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
    engine: boolean
    initialize: boolean,
    activeMovements: Set<Direction>
}

export interface MovementCommand {
    activeMovements: string[]
    lastCommand: string
}

export interface InitializeEngineResponse {
    initializeEngine: boolean;
    errorMessage: string;
}

export interface DistanceWarning {
    warning: WARNING_LEVEL,
}


export interface NegativeDistanceWarning {
    warning: string
}



