import {Player, SmallBoardProps} from "../../models";
import {Cell} from "./Cell.tsx";
import {MicroBoardWon} from "./MicroBoardWon.tsx";
import {useState, useRef, useEffect, useCallback} from "react";
import {useCheckWin} from "../../hooks/DetectWin.ts";
import {AllowToPlay, currentPlayer, MacroboardStatus} from "../../atoms";
import {useAtom} from "jotai";

export const SmallBoard = (props: SmallBoardProps) => {
    const [allowToPlay, setAllowToPlay] = useAtom(AllowToPlay)
    const [macroboardStatus,setMacroboardstatus] = useAtom(MacroboardStatus)
    const [isNext, setIsNext] = useState<boolean>(false);
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
        if (isWon) {
            setLocalWinner(thisMovePlayer);
            setDidAnimate(true);
            setMicroWon(true);
            const newStatus =macroboardStatus;
            newStatus[props.macroOrder]=player===Player.X?1:0;
            console.log("Macro ");
            console.log(newStatus);
            setMacroboardstatus([...newStatus]);
            const allowed = macroboardStatus
                .map((val, idx) => val === -1 ? idx : -1)
                .filter(idx => idx !== -1);
            const nextBoard = allowed.includes(position) ? [position] : [...allowed];
            setAllowToPlay(nextBoard);
            pendingUpdateRef.current = {
                board: updatedBoard,
                macroOrder: props.macroOrder,
                isWon: true,
            };
        } else {
            const allowed = macroboardStatus
                .map((val, idx) => val === -1 ? idx : -1)
                .filter(idx => idx !== -1);
            const nextBoard = allowed.includes(position) ? [position] : [...allowed];
            setAllowToPlay(nextBoard);
            switchPlayer();
            props.updateBoard(updatedBoard, props.macroOrder, false);
        }
    };

    useEffect(() => {
        if (microWon && pendingUpdateRef.current) {
            const {board, macroOrder, isWon} = pendingUpdateRef.current;
            props.updateBoard(board, macroOrder, isWon);
            switchPlayer();
            pendingUpdateRef.current = null;
        }
        if (allowToPlay.includes(props.macroOrder)) {
            setIsNext(true)
        } else {
            setIsNext(false)
        }
    }, [microWon, props, switchPlayer, allowToPlay]);

    if (microWon && localWinner !== null) {
        return <MicroBoardWon player={localWinner} animate={didAnimate}/>;
    }

    return (
        <div className="p-2 bg-gray-900">
            <div className={`grid grid-cols-3 gap-0.5 w-full h-full aspect-square bg-white`}>
                {props.board.map((cellValue, index) => (
                    <Cell
                        key={index}
                        getPlayer={() => player!}
                        changeColor={isNext}
                        getMove={handlePlayedMove}
                        position={index}
                        allowClick={!microWon}
                    />
                ))}
            </div>
        </div>
    );
};
