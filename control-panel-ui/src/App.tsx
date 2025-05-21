import {Navigate, Route, Routes, useNavigate} from 'react-router-dom';
import SchoolInfo from './SchoolInfo';
import Admin from './SchoolInfo/admin';
import './App.css';
import { WsClientProvider } from 'ws-request-hook';
import { useClientIdState } from './hooks/Wsclient';
import { KEYS } from './hooks/KEYS';
import { useEffect, useState } from 'react';
import  { Toaster } from 'react-hot-toast';
import LoginPageUser from "./components/login/user/LoginPageUser.tsx";
import LoginPage from "./SchoolInfo/auth/LoginPage.tsx";
import {useAtom} from "jotai/index";
import {CheckUserLogged} from "./atoms/UserLogged.ts";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const ws = import.meta.env.VITE_API_WS_SCHEMA;
const wss =import.meta.env.VITE_API_WSS_SCHEMA;
const prod = import.meta.env.PROD;


export default function App() {
  const manageClientId = useClientIdState(KEYS.CLIENT_ID);
  const [clientId] = useState(manageClientId.getClientId());
  const [isLoggedIn,_] = useAtom(CheckUserLogged);
  const [serverUrl, setServerUrl] = useState<string | undefined>(undefined);
  const navigate = useNavigate();


  useEffect(() => {
    const finalUrl = prod
        ? wss + baseUrl + '?id=' + clientId
        : ws + baseUrl + '?id=' + clientId;
    setServerUrl(finalUrl);
  }, [prod, baseUrl]);


  useEffect(() => {
    console.log(isLoggedIn);
    if (isLoggedIn) {
      navigate("/school-info/");
    }
  }, [isLoggedIn]);

  return (
      <>
        <Routes>
          <Route path="/" element={<Navigate to="/guest-login" replace />} />
          <Route path="/guest-login" element={<LoginPageUser />} />
          <Route path="/admin-login" element={<LoginPage />} />
        </Routes>

        <Toaster position="bottom-center" />

        {isLoggedIn && serverUrl && (
            <WsClientProvider url={serverUrl}>
              <Routes>
                <Route path="/school-info/*" element={<SchoolInfo />} />
                <Route path="/admin/*" element={<Admin />} />
              </Routes>
            </WsClientProvider>
        )}
      </>
  );
}
