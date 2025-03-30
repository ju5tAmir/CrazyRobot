export interface CellProps {
    color:string,
    getPlayer:()=>Player
    getMove:(position:number,value:number)=>void
    position:number
    allowClick:boolean
}

export enum Player{
    O=0,X
}
export interface WonProps
{
   player:Player
    animate:boolean
}

export interface SmallBoardProps{
    macroOrder:number
    board:number[]
    updateBoard:(value:number[],macro:number,isWon:boolean)=>void
}