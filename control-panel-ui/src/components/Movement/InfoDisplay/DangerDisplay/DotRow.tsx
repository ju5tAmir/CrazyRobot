import {DotColumnProps} from "../../../../models";
export const DotRow = (props:DotColumnProps) => {
 return (
    <div className="flex flex-row gap-2 justify-center">
        {Array.from({ length: props.size }).map((_, idx) => (
            <div
                key={idx}
                className={`w-3 h-3 rounded-sm ${props.color===""?"bg-gray-400":props.color} shadow-sm`}
            ></div>
        ))}
    </div>
 )
}
