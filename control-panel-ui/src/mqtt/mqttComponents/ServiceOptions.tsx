import {useMqttPublish} from "../mqttclient.ts";
import {MqttClient} from "mqtt";
import {useState} from "react";

interface Actions{
    onMessage:(value:string)=>void,
    title:string,
    image:string,
    value:string
}


export const ServiceOption=(configs:Actions)=>{
    const [val,_]= useState<string>(configs.value)




    return (
        <button onClick={()=>configs.onMessage(val)} className=" h-10 w-10 btn btn-xs sm:btn-sm md:btn-md lg:btn-lg mr-5 hover:bg-emerald-400 hover:rounded-2xl">
            <img src={configs.image} className={"h-10 w-10"}  alt={configs.title}/>
        </button>
    )


}
