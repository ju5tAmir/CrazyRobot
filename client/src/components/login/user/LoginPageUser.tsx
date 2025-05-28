import {useState} from "react";
import {LoginModalUser} from "./LoginModalUser.tsx";

export default function LoginPageUser() {
    const [openModal, setOpenModal] = useState(false);

    const openModalAction = () => {
        setOpenModal(true)
    }

    const closeModalAction = () => {
        setOpenModal(false);
    }
    return (
        <div> {/* Root container */}
            <div className="flex items-center flex-col gap-2 mt-6">
                <div>
                    <h2 className="text-4xl leading-loose font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-purple-600">
                        WALL-Ecome!!
                    </h2>
                </div>
                <div>
                    <h2 className="text-4xl leading-loose font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-purple-600">
                        Drive me to the moon or play with me some tic-tac-toe, hop in!
                    </h2>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => openModalAction()}
                        className="w-36 h-15 text-purple-500 py-2 bg-transparent font-semibold rounded-md border border-purple-600 hover:bg-purple-500 hover:text-white transition-colors duration-300 text-center">
                        WALL-E Access
                    </button>
                </div>
                <LoginModalUser isOpen={openModal} setIsOpen={closeModalAction}></LoginModalUser>
            </div>
        </div>
    );

}