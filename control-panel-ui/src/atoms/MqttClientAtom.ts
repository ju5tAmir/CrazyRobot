import {atom} from 'jotai';
import {MqttClient} from "mqtt";

export const mqttClientAtom = atom<MqttClient | null>();