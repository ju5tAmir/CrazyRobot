import {atom} from "jotai";
import {Player, UTTTWonBoard} from "../models";


export const UTTTWonBoardsState = atom<Map<number, UTTTWonBoard>>(
    new Map<number, UTTTWonBoard>()
);


//Todo enable the user to chose what side to play
export const currentPlayer = atom<Player|null>(Player.X)
