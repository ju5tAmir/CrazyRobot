import {DIRECTION_WARNING} from "../index.ts";

export interface DangerDisplayProps {
   orientation:DangerDisplayOrientation;
   position:DIRECTION_WARNING;
}

export interface DotColumnProps{
    size:number;
    color:string;
}

export enum DangerDisplayOrientation{
    HORIZONTAL,
    VERTICAL
}

