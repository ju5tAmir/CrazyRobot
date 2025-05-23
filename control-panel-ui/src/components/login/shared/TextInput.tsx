import {UserInputProps} from "../../../models/login-models/UserNameProps.ts";

export const TextInput = ({getInputValue, placeholder, value}: UserInputProps) => {
    return (
        <div className="input text-purple-500 py-2 bg-transparent font-semibold rounded-md border border-purple-600 flex items-center gap-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70">
                <path
                    d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"/>
            </svg>
            <input
                onChange={(e) => getInputValue(e.target.value)}
                type="text"
                className="grow"
                placeholder={placeholder}
                value={value}
            />
        </div>
    )
}