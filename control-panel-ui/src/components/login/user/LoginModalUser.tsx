import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {TextInput} from "../shared/TextInput.tsx";
import toast from "react-hot-toast";
import {LoginUserProps} from "../../../models"
import {ErrorMessages} from "../../../helpers";
import {ValidationError} from "../../../helpers";
import {useAuth} from "../../../helpers";
import Loading from "../../../shared/Loading.tsx";

export const LoginModalUser = ({isOpen, setIsOpen}: LoginUserProps) => {
    const navigate = useNavigate();
    const authLogin = useAuth();
    const [modalClass, setModalClass] = useState("");
    const [serverErrors, setServerErrors] = useState<ValidationError | null>(null);
    const [serverErrorMessages, setServerErrorMessages] = useState<string[]>([]);
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
        if (serverErrors) {
            const serverMessages: string[] = [];
            Object.entries(serverErrors).forEach(([, messages]) => {
                if (messages) {
                    messages.forEach((message) => {
                        if (message) {
                            serverMessages.push(message);
                            toast.error(message);
                        }
                    });
                }
            });
            setServerErrorMessages(serverMessages);
        }
    }, [serverErrors, isOpen]);


    const closeModal = () => {
        setModalClass(isOpen ? "modal-open" : "");
        setModalState(initialState);
        setServerErrors(null);
        setServerErrorMessages([])
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
                errors: {...prev.errors, username: ErrorMessages.UserName},
                required: {...prev.required, username: true}
            }))
            return;
        }

        if (isInputEmpty(modalState.email)) {
            setModalState((prev) => ({
                ...prev,
                errors: {...prev.errors, email: ErrorMessages.EmailInvalid},
                required: {...prev.required, email: true}
            }))
            return;
        }

        setModalState((prev) => (
            {...prev, loading: true}));
        authLogin
            .loginOrRegisterUser(modalState.email, modalState.username)
            .then(() => {
                navigate("/school-info/robot-movement");
            })
            .catch((e) => {
                setModalState((prev) => ({
                    ...prev,
                    loading: false
                }));
                const errorData = e.response?.data;
                if (errorData?.errors) {
                    setServerErrors(errorData.errors);
                } else if (errorData?.message) {
                    toast.error(errorData.message);
                } else {
                    toast.error("Network error. Please try again later.");
                }
        });
    }

    return (
        <dialog className={`modal ${modalClass}`}>
            <div className="modal-box">

                <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>

                <h3 className="font-bold text-lg mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-purple-600">WALL-E Login</h3>

                <div className={"flex flex-col items-center gap-4 px-2 mb-6"}>
                    <TextInput
                        getInputValue={setUserName}
                        value={modalState.username}
                        placeholder={"Username"}
                    />
                    <TextInput
                        getInputValue={setUserEmail}
                        value={modalState.email}
                        placeholder={"Email"}
                    />
                </div>

                <div className={"flex flex-col items-center mb-4"}>
                    {modalState.loading ? (
                        <div className={"mb-6"}>
                            <Loading/>
                        </div>
                    ) : (
                        <div className="text-center mb-6">
                            <p className={`${modalState.required.username ? "text-red-400" : "text-transparent"} `}>
                                {modalState.errors.username}
                            </p>
                            <p className={`${modalState.required.email ? "text-red-400" : "text-transparent"} `}>
                                {modalState.errors.email}
                            </p>
                            <p className={`${serverErrorMessages.length > 0 ? "text-red-400" : "text-transparent"}`}>
                                {serverErrorMessages}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-center">
                        <button onClick={loginUser}
                                className="w-36 h-15 text-purple-500 py-2 bg-transparent font-semibold rounded-md border border-purple-600 hover:bg-purple-500 hover:text-white transition-colors duration-300 text-center">
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    )
}