import {useEffect, useRef} from "react";
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


export  function ModalComponent() {
    const manageClientId = useClientIdState(KEYS.CLIENT_ID);
    const {showModal,setShowModal} = useTimerHook();
    const {sendRequest}= useWsClient();
    const modalRef = useRef<HTMLDialogElement>(null);
    const navigate = useNavigate();



    useEffect(() => {
        const dialog = modalRef.current;
        if (!dialog) return;

        if (showModal) {
            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
        }
    }, [showModal]);




    const sendConfirmationToServer  = async ()=>{
        const request:ClientSendsTimerConfirmationDto =  {
            status:true,
            clientId:manageClientId.getClientId()||"",
            eventType:StringConstants.ClientSendsTimerConfirmationDto,
            requestId:crypto.randomUUID(),
        }
        try{
            const timerSentResult: ServerConfirmsDto = await sendRequest<ClientSendsTimerConfirmationDto,ServerConfirmsDto>(request,StringConstants.ServerConfirmsDto);
            if (timerSentResult?.success) {
                toast.success("You're still active. Timer successfully confirmed.");
                setShowModal(false);
            } else {
                toast.error("Session ended due to inactivity. Please log in again.");
                navigate("/");
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
                    <p className="py-4">Press ESC key or click the button below to close</p>
                    <div className="modal-action">
                        <button className="btn" onClick={sendConfirmationToServer}>OK</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
