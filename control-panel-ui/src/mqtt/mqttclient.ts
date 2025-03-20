import mqtt, { IClientOptions, MqttClient } from "mqtt";
import { useEffect, useState } from "react";


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
        console.log(`📡 Subscribing to topic before: ${topic}`);
        if (!client || !client.connected){
            console.log("No client");
            console.log(client?.connected);
            console.log(client===null);
            return;
        }
        const handleMsg = (receivedTopic: string, message: Buffer) => {
            if (receivedTopic === topic) {
                console.log(`📩 Received message: ${message.toString()}`);
                const received = { topic: receivedTopic, value: message.toString() };
                console.log(received);
                onMessageReceived(received);
            }
        };
        console.log(`📡 Subscribing to topic after: ${topic}`);
        client.subscribe(topic);
        client.on("message", handleMsg);

        return () => {
            console.log(`📴 Unsubscribing from topic: ${topic}`);
            client.unsubscribe(topic);
            client.off("message", handleMsg);
        };
    }, [client,topic,onMessageReceived]);
}

/**
 * 🚀 useMqttPublish Hook: Returns a publish function for sending MQTT messages.
 */
export const useMqttPublish = (client: MqttClient | null) => {
    const publish = (request:BroadcastResponse, options: object = {}) => {
        if (client && client.connected) {
            console.log(`🚀 Publishing message: ${request.value} to topic: ${request.topic}`);
            const payload= JSON.stringify({topic:request.topic,value:request.value})
            client.publish(request.topic,payload, options);
        } else {
            console.warn("⚠️ Cannot publish: MQTT client not connected.");
        }
    };
    return publish;
};
