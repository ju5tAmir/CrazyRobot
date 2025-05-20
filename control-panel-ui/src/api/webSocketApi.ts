import {BaseDto} from "ws-request-hook";
import {
    ClientCommand,
    Command, DistanceWarning,
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
export interface DangerMovementDto extends BaseDto {
    command: ClientCommand<DistanceWarning>;
}

export interface ServerSendsTimerDto extends BaseDto {
    status:boolean
    clientId:string
}

export interface ClientSendsTimerConfirmationDto extends BaseDto {
    status:boolean,
    clientId:string
}




// unsubscribe client when user leaves the robot page
export interface ClientUnsubscribeFromRobotTopicDto extends BaseDto{
    clientId:string
}
//server response for the client unsubscribe when the user leaves the page
export interface ServerUnsubscribedClientFromRobotTopicDto extends BaseDto {
    unsubscribed:boolean
}

//subscribe client when user enter the robot page
export interface ClientSubscribeToRobotTopicDto extends BaseDto {
    clientId:string
}

// server confirmation if the user succesfully subscribed
export interface ServerSubscribedClientToRobotTopicDto extends BaseDto {
    subscribed:boolean
}



export interface ServerSendsErrorMessageDto {
    eventType: "ServerSendsErrorMessage";
    requestId: string;
    message: string;
}



export enum StringConstants {
    EngineStateDto="EngineStateDto",
    ServerConfirmsDto="ServerConfirmsDto",
    ServerSendsErrorMessageDto = "ServerSendsErrorMessageDto",
    InitializeEnginResponseDto="InitializeEnginResponseDto",
    RobotMovementDto = "RobotMovementDto",
    NegativeDistanceNotifierDto="NegativeDistanceNotifierDto",
    DangerMovementDto = "DangerMovementDto",
    ServerSendsTimerDto= "ServerSendsTimerDto",
    ClientSendsTimerConfirmationDto ="ClientSendsTimerConfirmationDto",
    ClientSubscribeToRobotTopicDto = "ClientSubscribeToRobotTopicDto",
    ServerSubscribedClientToRobotTopicDto="ServerSubscribedClientToRobotTopicDto",
    ClientUnsubscribeFromRobotTopicDto ="ClientUnsubscribeFromRobotTopicDto",
    ServerUnsubscribedClientFromRobotTopicDto = "ServerUnsubscribedClientFromRobotTopicDto"
}