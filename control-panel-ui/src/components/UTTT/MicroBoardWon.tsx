import {Player, WonProps} from "../../models";
import './animation.css'

export const MicroBoardWon=(props:WonProps)=>{


    return (
        <div className={`${props.player===Player.O?"bg-teal-600":"bg-red-600"}  ${props.animate ? 'fade-in-right' : ''} flex flex-row justify-center items-center w-full h-full aspect-square  `}>
            <h1>{props.player===Player.O?"0":"X"}</h1>
        </div>
    )


}