import {Player, WonProps} from "../../models";
import './animation.css'
import {useEffect, useState} from "react";

interface Microstate{
    text:string
    design:string
}

export const MicroBoardWon=(props:WonProps)=>{
    const [state,setState]= useState<Microstate>({
        text:"",
        design:""
    });

    useEffect(() => {
        if(props.player===Player.O){
            const newState={...state,design:"bg-teal-600",text:"O"}
            setState(newState);
            return;
        }
        if(props.player===Player.X){
            const newState={...state,design:"bg-red-600",text:"X"}
            setState(newState);
            return;
        }
        if(props.player===Player.D){
            const newState={...state,design:"bg-pink-600",text:"X/O"}
            setState(newState);
            return;
        }
    }, [props.player]);


    return (
        <div className={`${state.design} ${props.animate ? 'fade-in-right' : ''} flex flex-row justify-center items-center w-full h-full aspect-square  `}>
            <h1>{state.text}</h1>
        </div>
    )
}