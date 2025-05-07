export interface DangerDisplayProps {
   orientation:DangerDisplayOrientation;
   position:POSITION
}

export interface DotColumnProps{
    size:number;
    color:string;
}

export enum DangerDisplayOrientation{
    HORIZONTAL,
    VERTICAL
}

export enum POSITION{
    FRONT,
    BACK,LEFT,RIGHT
}