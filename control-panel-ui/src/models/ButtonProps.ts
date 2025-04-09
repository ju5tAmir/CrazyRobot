export interface ButtonProps {
    value:string,
    handlePressed:(key:string)=>void,
    handleReleased:(key:string)=>void,
    color:string,
    handleIsKeyPressed:Set<string>,
    handleEngineState:boolean
}

