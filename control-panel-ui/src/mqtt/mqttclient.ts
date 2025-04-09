import {MqttClient } from "mqtt";
import { useEffect, useRef} from "react";
import MoveDetails from "./mqttComponents/MoveDetails.ts";
const mqtt_topic = import.meta.env.VITE_MQTT_TOPIC;

export interface Subscription {
    qos: string;
    topic: string;
    client: MqttClient |null;
    onMessageReceived: (response: BroadcastResponse) => void;
}

export enum mqttTypes {
    connect = "connect",
    error = "error",
    reconnect = "reconnect",
    close="close"
}

export interface BroadcastResponse {
    topic: string;
    value: string;
}

export function useMqttSubscribe({ client, topic, onMessageReceived }: Subscription) {
    const isSubscribed = useRef(false);

    useEffect(() => {
        if (!client) {
            console.warn(" MQTT client not ready for subscribing.");
            return;
        }

        const handleMsg = (receivedTopic: string, message: Buffer) => {
            if (receivedTopic === topic) {
                const received = { topic: receivedTopic, value: message.toString() };
                onMessageReceived(received);
            }
        };

        const subscribeToTopic = () => {
            if (!client.connected || client.disconnecting) {
                console.warn(` Cannot subscribe to "${topic}" — client not connected yet.`);
                return;
            }
            client.subscribe(topic, (err) => {
                if (err) {
                    console.error(` Failed to subscribe to "${topic}"`, err);
                } else {
                    console.log(` Subscribed to "${topic}"`);
                    isSubscribed.current = true;
                }
            });
        };


        const handleReconnect = () => {
            console.log(`🔄 Reconnected, re-subscribing to "${topic}"...`);
            subscribeToTopic();
        };

        try {
            subscribeToTopic();
            client.on("connect", handleReconnect);
            client.on("reconnect", handleReconnect);
            client.on("message", handleMsg);
        } catch (err) {
            console.error(`Error during subscribe to "${topic}"`, err);
        }

        return () => {
            try {
                if (isSubscribed.current) {
                    client.unsubscribe(topic, (err) => {
                        if (err) {
                            console.error(`Failed to unsubscribe from "${topic}"`, err);
                        } else {
                            console.log(`Unsubscribed from "${topic}"`);
                        }
                    });
                    isSubscribed.current = false;
                }
                client.off("connect", handleReconnect);
                client.off("reconnect", handleReconnect);
                client.off("message", handleMsg);
            } catch (err) {
                console.error(`Error during unsubscribe/cleanup for "${topic}"`, err);
            }
        };
    }, [client, topic]);
}


/**
 * 🚀 useMqttPublish Hook: Returns a publish function for sending MQTT messages.
 */
export const useMqttPublish = (client: MqttClient | null) => {
    const publish = (request:MoveDetails, options: object = {}) => {
        if (client && client.connected && client.disconnecting) {
            const payload= JSON.stringify(request)
            client.publish(mqtt_topic,payload, options);
        } else {
            console.warn("⚠️ Cannot publish: MQTT client not connected.");
        }
    };
    return publish;
};









