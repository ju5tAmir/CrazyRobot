import { useEffect, useState, useRef } from "react";
import mqtt, { MqttClient } from "mqtt";
import { BroadcastResponse, mqttTypes } from "../../mqtt/mqttclient.ts";
import MoveDetails from "../../mqtt/mqttComponents/MoveDetails.ts";

export const useMqtt = () => {
    const client = useRef<MqttClient | null>(null);
    const [connectStatus, setConnectStatus] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<BroadcastResponse[]>([]);

    const mqtt_host = import.meta.env.VITE_MQTT_HOST;
    const mqtt_username = import.meta.env.VITE_MQTT_TOKEN;
    const mqtt_subscribe = import.meta.env.VITE_MQTT_RECEIVE;

    const isConnectedRef = useRef(false);

    useEffect(() => {
        if (isConnectedRef.current) {
            console.log("🔵 Already connected, skipping re-connection.");
            return;
        }

        const mqttOptions = {
            username: mqtt_username,
            reconnectPeriod: 1000,
            clean: true,
        };

        console.log("⚡ Connecting to MQTT...");
        const mqttClient = mqtt.connect(mqtt_host, mqttOptions);

        mqttClient.on(mqttTypes.connect, () => {
            console.log("Connected to MQTT Server");
            isConnectedRef.current = true;
            client.current=mqttClient;
            setConnectStatus(true);
            subscribeToTopic(mqttClient,mqtt_subscribe);
            subscribeToTopic(mqttClient,"start");
        });

        mqttClient.on(mqttTypes.error, (err) => {
            console.error(` MQTT Connection Error: ${err.message}`);
            setError(err.message);
            setConnectStatus(false);
        });

        mqttClient.on(mqttTypes.reconnect, () => {
            console.log("🔄 Reconnecting...");
            setConnectStatus(false);
            if (mqttClient.connected) {
                subscribeToTopic(mqttClient,mqtt_subscribe);
                subscribeToTopic(mqttClient,"start");

            } else {
                mqttClient.once(mqttTypes.connect, () => {
                    console.log("Reconnected, re-subscribing...");
                    subscribeToTopic(mqttClient,mqtt_subscribe);
                    subscribeToTopic(mqttClient,"start");
                });
            }
        });

        mqttClient.on(mqttTypes.close, () => {
            console.log("Connection closed");
            isConnectedRef.current = false;
            setConnectStatus(false);
        });

        mqttClient.on("message", (topic, message) => {
            const incoming: BroadcastResponse = { topic, value: message.toString() };
            console.log("Incoming message:", incoming);
            setMessages(prev => [...prev, incoming]);
        });

        return () => {
            console.log("Cleaning up MQTT client...");
            mqttClient.removeAllListeners();
            mqttClient.end(true);
            isConnectedRef.current = false;
        };
    }, [mqtt_host, mqtt_username, mqtt_subscribe]);

    const subscribeToTopic = (mqttClient: MqttClient,topic:string) => {
        mqttClient.subscribe(topic, (err) => {
            if (err) {
                console.error(`Subscribe error for topic ${topic}: ${err.message}`);
            } else {
                console.log(`Subscribed to topic: ${topic}`);
            }
        });
    };

    const publishMovement = (topic: string, request:MoveDetails) => {
        if (!client.current || !client.current.connected) {
            console.error("Cannot publish, client not connected.");
            return;
        }
        const payload= JSON.stringify(request)
        client.current.publish(topic, payload, { qos: 0 }, (err) => {
            if (err) {
                console.error(`Publish error for topic ${topic}: ${err.message}`);
            } else {
                console.log(`Published message to ${topic}: ${payload}`);
            }
        });
    };
    const publishStartStopEvent = (topic:string,value:boolean)=>{
        if (!client.current || !client.current.connected) {
            console.error("Cannot publish, client not connected.");
            return;
        }
        const payload= value+""
        client.current.publish(topic, payload, { qos: 0 }, (err) => {
            if (err) {
                console.error(`Publish error for topic ${topic}: ${err.message}`);
            } else {
                console.log(`Published message to ${topic}: ${payload}`);
            }
        });
    }



    return {
        client,
        connectStatus,
        error,
        messages,
        publishMovement,
        publishStartStopEvent
    };
};
