import {CellProps, Player} from "../../models";
import {useState} from "react";

enum CellState{
    EMPTY,XPLAYER,OPLAYER
}

export const Cell = (props: CellProps) => {
    const [cellState, setCellState] = useState<CellState>(CellState.EMPTY);
    const [allowedClick, setAllowedClick] = useState<boolean>(props.allowClick);

    const onClick = () => {
        if (!allowedClick) return;
        const player = props.getPlayer();
        console.error(player,"from cell");
        let moveValue = -1;
        switch (player) {
            case Player.O:
                setCellState(CellState.OPLAYER);
                moveValue = 0;
                break;
            case Player.X:
                setCellState(CellState.XPLAYER);
                moveValue = 1;
                break;
        }
        props.getMove(props.position, moveValue);
        setAllowedClick(false);

    };



    return (
        <button
            onClick={onClick}
            className={`${
                allowedClick ?  "cursor-grab":"cursor-not-allowed"
            } w-full aspect-square flex items-center justify-center text-2xl font-bold ${
                cellState === CellState.EMPTY ? "bg-gray-900" :"" 
            } ${cellState===CellState.XPLAYER?"bg-red-500 text-white":"bg-gray-900"}
            ${cellState===CellState.OPLAYER?"bg-teal-500 text-white":"bg-gray-900"}`}
        >
            {cellState === CellState.XPLAYER ? "X" : cellState === CellState.OPLAYER ? "O" : ""}
        </button>
    );
};



