import {useRef} from "react";
import {SmallBoard} from "./SmallBoard.tsx";
import {Player} from "../../models";
import {useAtom} from "jotai";
import {currentPlayer} from "../../atoms";

export const  UTTTPage =()=>{
    const macroboardStatus = useRef<number[]>([-1,-1,-1,-1,-1,-1,-1,-1,-1]);
    const [player,]= useAtom(currentPlayer);
    const topLeftBoard = [-1,-1,-1,-1,-1,-1,-1,-1,-1];
    const topMiddleBoard = [-1,-1,-1,-1,-1,-1,-1,-1,-1];
    const topRightBoard = [-1,-1,-1,-1,-1,-1,-1,-1,-1];
    const leftMiddleBoard = [-1,-1,-1,-1,-1,-1,-1,-1,-1];
    const centerBoard = [-1,-1,-1,-1,-1,-1,-1,-1,-1];
    const centerRightBoard = [-1,-1,-1,-1,-1,-1,-1,-1,-1];
    const bottomLeftBoard = [-1,-1,-1,-1,-1,-1,-1,-1,-1];
    const centerBottomBoard = [-1,-1,-1,-1,-1,-1,-1,-1,-1];
    const bottomLowerBoard =[-1,-1,-1,-1,-1,-1,-1,-1,-1];
    const allBoards = useRef([topLeftBoard,topMiddleBoard,topRightBoard,leftMiddleBoard,centerBoard,centerRightBoard,bottomLeftBoard,centerBottomBoard,bottomLowerBoard]);
    const updateBoard=(value:number[],macro:number,isWin:boolean)=>{
        allBoards.current[macro]=[...value]
        if(isWin){
            macroboardStatus.current[macro]=player===Player.X?1:0
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden">
            <div className="w-full max-w-[90vmin] gap-2 aspect-square grid grid-cols-3 bg-cyan-300">
                {allBoards.current.map((b, index) => (
                        <SmallBoard
                            key={index}
                            updateBoard={updateBoard}
                            macroOrder={index}
                            board={b}
                        />
                ))}
            </div>

            <div className="mt-4 text-white">
                Current Player: {player === Player.X ? "X" : "O"}
            </div>
        </div>
    )


}
