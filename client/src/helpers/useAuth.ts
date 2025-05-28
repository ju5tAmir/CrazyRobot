import {useContext} from "react";
import {AuthContext} from "./useAuthContext.ts";

export const useAuth = () => useContext(AuthContext);
