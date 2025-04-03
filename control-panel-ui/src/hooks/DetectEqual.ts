import {Player} from "../models";

import {useCallback} from "react";
import {useCheckWin} from "./index.ts";
export const  useDetectEqual=()=>{
    const checkForWin = useCheckWin();

    const checkForDraw = useCallback((board: number[], player: Player): boolean => {
        let isDraw = true;
        if (!checkForWin.checkForWin(board, player)) {
            for (let i = 0; i < board.length; i++) {
                if (board[i] === -1) {
                    isDraw = false;
                    break;
                }
            }
        } else {
            isDraw = false;
        }

        return isDraw;
    }, []);

return{checkForDraw}
}