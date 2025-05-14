import {useContext} from "react";
import { AuthContext } from '../SchoolInfo/auth/AuthContext.tsx';

export const useAuth = () => useContext(AuthContext);
