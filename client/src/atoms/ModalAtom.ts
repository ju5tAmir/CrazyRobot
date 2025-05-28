
import {Disconnected} from "../models";
import {atom} from "jotai";

export const  ModalStateAtom  = atom<Disconnected>({
 disconnected:false,
 reason:""
});