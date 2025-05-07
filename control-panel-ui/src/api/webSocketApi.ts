import {BaseDto} from "ws-request-hook";
import {
    ClientCommand,
    Command,
    InitializeEngineResponse,
    NegativeDistanceWarning
} from "../models/mqttModels/MqttModels.ts";

export interface EngineStateDto extends BaseDto {
    command:Command
}

export interface RobotMovementDto extends BaseDto {
    command:Command
}
export interface NegativeDistanceNotifierDto extends BaseDto{
    command:ClientCommand<NegativeDistanceWarning>
}
export interface ServerConfirmsDto extends BaseDto {
    Success:boolean
}
export interface ServerSendsErrorMessageDto extends BaseDto {
    error?: string;
}

export interface InitializeEnginResponseDto extends BaseDto
{
    command: ClientCommand<InitializeEngineResponse>;
}


export enum StringConstants {
    EngineStateDto="EngineStateDto",
    ServerConfirmsDto="ServerConfirmsDto",
    ServerSendsErrorMessageDto = "ServerSendsErrorMessageDto",
    InitializeEnginResponseDto="InitializeEnginResponseDto",
    RobotMovementDto = "RobotMovementDto",
    NegativeDistanceNotifierDto="NegativeDistanceNotifierDto"
}