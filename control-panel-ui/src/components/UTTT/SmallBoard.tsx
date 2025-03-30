import { Player, SmallBoardProps } from "../../models";
import { Cell } from "./Cell.tsx";
import { MicroBoardWon } from "./MicroBoardWon.tsx";
import { useState, useRef, useEffect, useCallback } from "react";
import { useCheckWin } from "../../hooks/DetectWin.ts";
import { currentPlayer } from "../../atoms";
import { useAtom } from "jotai";

export const SmallBoard = (props: SmallBoardProps) => {
    const [player, setPlayer] = useAtom(currentPlayer);
    const [microWon, setMicroWon] = useState(false);
    const [localWinner, setLocalWinner] = useState<Player | null>(null);
    const [didAnimate, setDidAnimate] = useState(false);
    const checkForWin = useCheckWin();

    const pendingUpdateRef = useRef<{
        board: number[];
        macroOrder: number;
        isWon: boolean;
    } | null>(null);

    const switchPlayer = useCallback(() => {
        setPlayer(p => (p === Player.O ? Player.X : Player.O));
    }, [setPlayer]);

    const handlePlayedMove = (position: number, value: number) => {
        const updatedBoard = [...props.board];
        updatedBoard[position] = value;

        const thisMovePlayer = player!;
        const isWon = checkForWin.checkForWin(updatedBoard, thisMovePlayer);

        console.log(player === Player.X ? 1 : 0, "current");

        if (isWon) {
            setLocalWinner(thisMovePlayer);
            setDidAnimate(true);
            setMicroWon(true);

            pendingUpdateRef.current = {
                board: updatedBoard,
                macroOrder: props.macroOrder,
                isWon: true,
            };
        } else {
            switchPlayer();
            props.updateBoard(updatedBoard, props.macroOrder, false);
        }
    };

    useEffect(() => {
        if (microWon && pendingUpdateRef.current) {
            const { board, macroOrder, isWon } = pendingUpdateRef.current;
            props.updateBoard(board, macroOrder, isWon);
            switchPlayer();
            pendingUpdateRef.current = null;
        }
    }, [microWon, props, switchPlayer]);

    if (microWon && localWinner !== null) {
        return <MicroBoardWon player={localWinner} animate={didAnimate} />;
    }

    return (
        <div className="p-2 bg-gray-900">
            <div className="grid grid-cols-3 gap-0.5 w-full h-full aspect-square bg-white">
                {props.board.map((cellValue, index) => (
                    <Cell
                        key={index}
                        getPlayer={() => player!}
                        color="black"
                        getMove={handlePlayedMove}
                        position={index}
                        allowClick={!microWon}
                    />
                ))}
            </div>
        </div>
    );
};
