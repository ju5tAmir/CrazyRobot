import { ServiceOption } from "./ServiceOptions.tsx";
import {BroadcastResponse, mqttTypes, useMqttPublish, useMqttSubscribe} from "../mqttclient.ts";
import {useEffect, useState} from "react";
import mqtt, {MqttClient} from "mqtt";
const mqtt_host = import.meta.env.VITE_MQTT_HOST;
const mqtt_username = import.meta.env.VITE_MQTT_TOKEN;


export const ServicePage = () => {

    const [client, setClient] = useState<MqttClient | null>(null);
    const [connectStatus, setConnectStatus] = useState<boolean>(false);
    const [error, setError] = useState<string>("No error");
    const topic = "drive";
    const values: number[] = [0, 1, 2, 3];
    const paths: string[] = [
        "src/assets/sad.svg",
        "src/assets/neutral.svg",
        "src/assets/good.svg",
        "src/assets/happy.svg",
    ];

    const mqttOptions = {
        username: mqtt_username,
    };

    console.log(mqtt_host);
    console.log(mqtt_username);
    useEffect(() => {
        console.log("🚀 Connecting to MQTT...");
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



        return () => {
            console.log("📴 Disconnecting MQTT client...");
            mqttClient.removeAllListeners();
            mqttClient.end();
        };
    }, [mqttOptions.host]);


    const publish = useMqttPublish(client);


    const onMessage = (val: string) => {
        console.log("📤 Sending message:", val);
        publish({topic: topic, value: val});
    };

    return (
        <div className="flex justify-center w-screen h-20">
            {values.map((e, i) => (
                <ServiceOption
                    key={i}
                    onMessage={() => onMessage(e.toString())}
                    title={`Smiley symbol svg`}
                    value={e.toString()}
                    image={paths[i]}
                />
            ))}
        </div>
    );
};
