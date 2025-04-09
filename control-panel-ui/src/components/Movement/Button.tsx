import {ButtonProps} from "../../models/ButtonProps.ts";
import {useEffect,useState} from "react";
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from "react-icons/fa";

export const Button =(props:ButtonProps)=>{
   const [pressed,setPressed] = useState<boolean>(false);
   const [isActive,setIsActive] = useState<boolean>(props.handleEngineState);
    useEffect(() => {
        if(props.handleIsKeyPressed.has(props.value)){
            setPressed(true);
        }else{
            setPressed(false);
        }
        setIsActive(props.handleEngineState);

    }, [props.handleEngineState, props.handleIsKeyPressed, props.value]);
   const handlePressed = ()=>{
       setPressed(true);
       props.handlePressed(props.value);
    }

    const handleReleased=()=>{
        setPressed(false);
        props.handleReleased(props.value);
    }
    const decideUi=(val:string)=>{
        switch(val.toLowerCase()){
            case "w":return <FaArrowUp/>
            case "s":return <FaArrowDown/>
            case "a":return <FaArrowLeft/>
            case "d" :return <FaArrowRight/>
            default : return val
        }
    }

    return (
        <button
            onMouseDown={() => handlePressed()}
            onMouseUp={() =>handleReleased()}
            onTouchStart={() => handlePressed()}
            onTouchEnd={() => handleReleased()}
            className={`btn  ${isActive?"btn-neutral":""}  ${pressed?"bg-purple-600":""} `}
            disabled={!isActive}
        > {decideUi(props.value)}
        </button>
    )


}