import {useEffect, useRef, useState} from "react";
import {useTimerHook} from "../../hooks";
import {useWsClient} from "ws-request-hook";
import {
    ClientSendsTimerConfirmationDto,
    ServerConfirmsDto,
    ServerSendsErrorMessageDto,
    StringConstants
} from "../../api";
import toast from "react-hot-toast";
import {useClientIdState} from "../../hooks/Wsclient";
import {KEYS} from "../../hooks/KEYS";
import {useNavigate} from "react-router-dom";
import {ModalStateAtom} from "../../atoms";
import {useAtom} from "jotai/index";


export  function ModalComponent() {
    const manageClientId = useClientIdState(KEYS.CLIENT_ID);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {showModal,setShowModal} = useTimerHook();
    const {sendRequest}= useWsClient();
    const modalRef = useRef<HTMLDialogElement>(null);
    const navigate = useNavigate();
    const [disconnected,] = useAtom(ModalStateAtom);

    useEffect(() => {
        const dialog = modalRef.current;
        if (!dialog) return;
        if (showModal) {
            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
        }
    }, [showModal]);


    const actOnClick = ()=>{
        if(disconnected.disconnected){
            toast.error(disconnected.disconnected+"");
            setShowModal(false);
        return;
        }
        toast.error(disconnected.disconnected+"");
        sendConfirmationToServer();
    }

    const sendConfirmationToServer  = async ()=>{
        setIsSubmitting(true);
        const request:ClientSendsTimerConfirmationDto =  {
            status:true,
            clientId:manageClientId.getClientId()||"",
            eventType:StringConstants.ClientSendsTimerConfirmationDto,
            requestId:crypto.randomUUID(),
        }
        try{
            const timerSentResult: ServerConfirmsDto = await sendRequest<ClientSendsTimerConfirmationDto,ServerConfirmsDto>(request,StringConstants.ServerConfirmsDto);
            setIsSubmitting(false);
            if (timerSentResult?.success) {
                toast.success("You're still active. Timer successfully confirmed.");
                setShowModal(false);
            } else {
                toast.error("Session ended due to inactivity. Please log in again.");
                navigate("/school-info");
                setShowModal(false);
            }
        }catch (error){
            const errorDto = error as unknown as ServerSendsErrorMessageDto;
            toast.error("ErrorReceived");
            toast.error(errorDto.message!);
            setShowModal(false);
        }
    }

    return (
        <div>
            <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle" ref={modalRef}>
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Hello!</h3>
                    <p className="py-4">{disconnected.disconnected?disconnected.reason:"Press ok to confirm that you are active,otherwise you will be disconnected, in one minute from when this message was displayed"}</p>
                    <div className="modal-action">
                        <button className="btn" disabled={isSubmitting} onClick={actOnClick}>OK</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
