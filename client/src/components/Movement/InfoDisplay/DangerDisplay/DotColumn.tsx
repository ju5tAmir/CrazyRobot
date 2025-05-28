import {DotColumnProps} from "../../../../models";


export const DotColumn = (props:DotColumnProps) => (
    <div className="flex flex-col gap-2">
        {Array.from({ length: props.size }).map((_, idx) => (
            <div
                key={idx}
                className={`w-3 h-3 rounded-sm  ${props.color===""?"bg-gray-400":props.color} shadow-sm`}
            ></div>
        ))}
    </div>
);