
import {BroadcastResponse, mqttTypes, useMqttPublish, useMqttSubscribe} from "../mqttclient.ts";
import {useEffect, useState} from "react";
import mqtt, {MqttClient} from "mqtt";
import MoveDetails from "./MoveDetails.ts";
import { useAtom } from "jotai";
import { mqttClientAtom } from "../../atoms/MqttClientAtom.ts";
const mqtt_host = import.meta.env.VITE_MQTT_HOST;
const mqtt_username = import.meta.env.VITE_MQTT_TOKEN;


export const ServicePage = ({data}:{data: MoveDetails}) => {

    const [client, setClient] = useAtom(mqttClientAtom);
    const [error, setError] = useState<string>("No error");
    const [connectStatus, setConnectStatus] = useState<boolean>(false);

    const mqttOptions = {
        username: mqtt_username,
    };

    useEffect(() => {
        if (!client) {
            const mqttClient = mqtt.connect(mqtt_host, mqttOptions);

            mqttClient.on(mqttTypes.connect, () => {
                console.log("✅ Connected to MQTT Server");
                setClient(mqttClient);

                setConnectStatus(true);

            });

            mqttClient.on(mqttTypes.error, (err) => {
                console.error(`❌ MQTT Connection Error: ${err.message}`);
                setError(err.message);
            });

            mqttClient.on(mqttTypes.reconnect, () => {
                console.log("🔄 Reconnecting...");
                setConnectStatus(true);
                if(!client?.connected){
                    setClient(null);
                }
            });
        }


        return () => {
            console.log("📴 Disconnecting MQTT client...");
            mqttClient.removeAllListeners();
            mqttClient.end();
        };
    }, [mqttOptions.host]);


    const publish = useMqttPublish(client);


    const onMessage = (data: MoveDetails) => {
        publish(data);
    };

    return (
        onMessage(data)
    );
};
