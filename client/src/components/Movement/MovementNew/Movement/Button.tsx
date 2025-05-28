
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import {ButtonProps} from "../../../../models/ButtonProps.ts";

export const Button = (props: ButtonProps) => {

    const handlePressed = () => {
        props.handlePressed(props.value);
    };

    const handleReleased = () => {
        props.handleReleased(props.value);
    };

    const decideUi = (val: string) => {
        switch (val.toLowerCase()) {
            case "w": return <FaArrowUp />;
            case "s": return <FaArrowDown />;
            case "a": return <FaArrowLeft />;
            case "d": return <FaArrowRight />;
            default: return val.toUpperCase();
        }
    };

    const isActive = props.isPressed&&props.handleEngineState
    return (
        <button
            onMouseDown={handlePressed}
            onMouseUp={handleReleased}
            onTouchStart={handlePressed}
            onTouchEnd={handleReleased}
            disabled={!props.handleEngineState}
            className={`w-1/6 btn ${props.handleEngineState ? "btn-neutral" : ""} ${isActive ? "bg-purple-600" : ""} transition-all duration-150`}
        >
            {decideUi(props.value)}
        </button>
    );
};
