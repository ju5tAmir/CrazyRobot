import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {LoginUserProps} from "../../../models/login-models/user/LoginUserProps.ts"
import {useAuth} from "../../../SchoolInfo/auth/AuthContext.tsx";
import {TextInput} from "../shared/TextInput.tsx";

export const LoginModalUser = ({isOpen, setIsOpen}: LoginUserProps) => {
    const navigate = useNavigate();
    const { loginOrRegisterUser } = useAuth();
    const [modalClass, setModalClass] = useState("");
    const initialState = {
        username:"",
        email: "",
        errors: {
            username: "",
            email: "",
        },
        required: {
            username: false,
            email: false,
        }, loading: false
    }
    const [modalState, setModalState] = useState(initialState);

    useEffect(() => {
        setModalClass(isOpen ? "modal-open" : "");
    }, [isOpen]);


    const closeModal = () => {
        setModalClass(isOpen ? "modal-open" : "");
        setModalState(initialState);
        setIsOpen();
    }

    const setUserName = (userName: string) => {
        setModalState((prev) => ({
            ...prev,
            username: userName,
            errors: {...prev.errors, username: ""},
            required: {...prev.required, username: false}
        }))
    }

    const setUserEmail = (userEmail: string) => {
        setModalState((prev) => ({
            ...prev,
            email: userEmail,
            errors: {...prev.errors, email: ""},
            required: {...prev.required, email: false}
        }))
    }

    const isInputEmpty = (input: string) => {
        return input.length === 0;
    }

    const loginUser = () => {
        if (isInputEmpty(modalState.username)) {
            setModalState((prev) => ({
                ...prev,
                errors: {...prev.errors, username: "Username is required"},
                required: {...prev.required, username: true}
            }))
            return;
        }

        if (isInputEmpty(modalState.email)) {
            setModalState((prev) => ({
                ...prev,
                errors: {...prev.errors, email: "Email is required"},
                required: {...prev.required, email: true}
            }))
            return;
        }

        setModalState((prev) => (
            {...prev, loading: true}));
            loginOrRegisterUser(modalState.email).then(() => {
                navigate("/school-info/RobotMovement");
            })
    }

    return (
        <dialog className={`modal ${modalClass}`}>
            <div className="modal-box">
                <div>
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕
                    </button>
                </div>
                <div className={"flex flex-col gap-2 mt-2"}>
                    <TextInput getInputValue={setUserName} value={modalState.username}
                               placeholder={"Username"}></TextInput>
                    <TextInput getInputValue={setUserEmail} value={modalState.email}
                                   placeholder={"Email"}></TextInput>
                </div>
                <div className={"flex flex-row justify-end mt-2"}>
                    {modalState.loading ? (
                        <div className={"mr-2"}>
                            <p>Loading...</p>
                        </div>
                    ) : (
                        <div className="mr-2">
                            <p className={`${modalState.required.username ? "text-purple-600" : "text-transparent"} `}>
                                {modalState.errors.username}
                            </p>
                            <p className={`${modalState.required.email ? "text-purple-600" : "text-transparent"} `}>
                                {modalState.errors.email}
                            </p>
                        </div>
                    )}
                    <button onClick={loginUser}
                            className="w-36 h-15 text-white py-2 bg-purple-600 font-semibold rounded-md border border-transparent hover:bg-black hover:text-white hover:border-black transition-colors duration-300 text-center">
                        Login
                    </button>
                </div>
            </div>
        </dialog>
    )
}