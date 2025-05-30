
import {
    ClientSubscribeToRobotTopicDto, ClientUnsubscribeFromRobotTopicDto,
    ServerSendsErrorMessageDto, ServerSubscribedClientToRobotTopicDto, ServerUnsubscribedClientFromRobotTopicDto,
    StringConstants
} from "../../../../api";
import {BaseDto} from "ws-request-hook/dist/types/types";
import toast from "react-hot-toast";


export const subscribeClientToRobot = async (
    clientId: string,
    sendRequest: <TReq extends BaseDto, TRes extends BaseDto>(request: TReq, expectedResponseEventType: string, timeoutMs?: number) => Promise<TRes>
): Promise<boolean> => {
    const request: ClientSubscribeToRobotTopicDto = {
        clientId,
        eventType: StringConstants.ClientSubscribeToRobotTopicDto,
        requestId: crypto.randomUUID()
    };

    try {
        const response= await sendRequest<ClientSubscribeToRobotTopicDto, ServerSubscribedClientToRobotTopicDto>(
            request,
            StringConstants.ServerSubscribedClientToRobotTopicDto
        );
        return response.subscribed;
    } catch (error) {
        const errorDto = error as ServerSendsErrorMessageDto;
        toast.error(errorDto.message ?? 'Subscription failed');
        return false;
    }
};



export const unsubscribeClientFromRobot = async (
    clientId: string,
    sendRequest: <TReq extends BaseDto, TRes extends BaseDto>(request: TReq, expectedResponseEventType: string, timeoutMs?: number) => Promise<TRes>
): Promise<boolean> => {
    const request:ClientUnsubscribeFromRobotTopicDto = {
        clientId,
        eventType: StringConstants.ClientUnsubscribeFromRobotTopicDto,
        requestId: crypto.randomUUID()
    };

    try {
        const unsubscribed = await sendRequest<ClientUnsubscribeFromRobotTopicDto, ServerUnsubscribedClientFromRobotTopicDto>(
            request,
            StringConstants.ServerUnsubscribedClientFromRobotTopicDto
        );
        return unsubscribed.unsubscribed;
    } catch (error) {
        const errorDto = error as ServerSendsErrorMessageDto;
        toast.error(errorDto.message ?? 'Unsubscription failed');
        return false;
    }
};
