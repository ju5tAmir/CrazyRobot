import { useCallback } from "react";

export const useCheckWin = () => {
    const checkRows = useCallback((board: number[], player: number): boolean => {
        for (let i = 0; i <= 6; i += 3) {
            if (
                board[i] === player &&
                board[i + 1] === player &&
                board[i + 2] === player
            ) {
                return true;
            }
        }
        return false;
    }, []);

    const checkColumns = useCallback((board: number[], player: number): boolean => {
        for (let i = 0; i <= 2; i++) {
            if (
                board[i] === player &&
                board[i + 3] === player &&
                board[i + 6] === player
            ) {
                return true;
            }
        }
        return false;
    }, []);

    const checkDiagonals = useCallback((board: number[], player: number): boolean => {
        return (
            (board[0] === player && board[4] === player && board[8] === player) ||
            (board[2] === player && board[4] === player && board[6] === player)
        );
    }, []);

    const checkForWin = useCallback((board: number[], player: number): boolean => {
        console.log(board,"passed for the check");
        console.log(player, "passed for the check")
        console.log( checkRows(board, player) ||
            checkColumns(board, player) ||
            checkDiagonals(board, player),"the score");
        return (
            checkRows(board, player) ||
            checkColumns(board, player) ||
            checkDiagonals(board, player)
        );
    }, [checkRows, checkColumns, checkDiagonals]);

    return { checkForWin };
};
