import { Navigate, Route, Routes } from 'react-router-dom';
import SchoolInfo from './SchoolInfo';
import Admin from './SchoolInfo/admin';
import './App.css';
import { WsClientProvider } from 'ws-request-hook';
import { useClientIdState } from './hooks/Wsclient';
import { KEYS } from './hooks/KEYS';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import LoginPageUser from "./components/login/user/LoginPageUser.tsx";
import LoginPage from "./SchoolInfo/auth/LoginPage.tsx";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const prod = import.meta.env.PROD;
export default function App() {
  const manageClientId = useClientIdState(KEYS.CLIENT_ID);
  const [clientId] = useState(manageClientId.getClientId());
  const [serverUrl, setServerUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const finalUrl = prod
      ? 'wss://' + baseUrl + '?id=' + clientId
      : 'ws://' + baseUrl + '?id=' + clientId;
    setServerUrl(finalUrl);
    console.log(finalUrl);
  }, [prod, baseUrl]);
  return (
    <>
      {serverUrl && (
        <WsClientProvider url={serverUrl}>
          {/*<WebsocketConnectionIndicator></WebsocketConnectionIndicator>*/}
          <Routes>
            <Route path="/" element={<Navigate to="/guest-login" replace />} />

            <Route path="/guest-login" element={<LoginPageUser />} />
            <Route path="/school-info/*" element={<SchoolInfo />} />

            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/*" element={<Admin />} />
          </Routes>
          <Toaster />
        </WsClientProvider>
      )}
    </>
  );
}
