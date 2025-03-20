import {Subscription, useMqttSubscribe} from "../mqttclient.ts";


interface SubscriptionOp{
    message:string,
    subscription:Subscription|null
}
export const MessageSubscription=({subscription,message}:SubscriptionOp)=>{
    useMqttSubscribe(subscription ?? { qos: "0", topic: "", client: null, onMessageReceived: () => {} });

    return <div>Latest message: {message}</div>;
}
