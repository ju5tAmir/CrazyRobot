import mqtt, { IClientOptions, MqttClient } from "mqtt";
import { useEffect, useState } from "react";
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
    reconnect = "reconnect"
}

export interface BroadcastResponse {
    topic: string;
    value: string;
}

export function useMqttSubscribe({client,topic,onMessageReceived}:Subscription ) {
    useEffect(() => {
        if (!client || !client.connected){
            return;
        }
        const handleMsg = (receivedTopic: string, message: Buffer) => {
            if (receivedTopic === topic) {
                const received = { topic: receivedTopic, value: message.toString() };
                onMessageReceived(received);
            }
        };
        client.subscribe(topic);
        client.on("message", handleMsg);

        return () => {
            client.unsubscribe(topic);
            client.off("message", handleMsg);
        };
    }, [client,topic,onMessageReceived]);
}

/**
 * 🚀 useMqttPublish Hook: Returns a publish function for sending MQTT messages.
 */
export const useMqttPublish = (client: MqttClient | null) => {
    const publish = (request:MoveDetails, options: object = {}) => {
        if (client && client.connected) {
            const payload= JSON.stringify(request)
            client.publish(mqtt_topic,payload, options);
        } else {
            console.warn("⚠️ Cannot publish: MQTT client not connected.");
        }
    };
    return publish;
};
