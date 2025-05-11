import { Navigate, Route, Routes } from 'react-router-dom';
import { UTTTPage } from './components/UTTT/UTTTpage';
import SchoolInfo from './SchoolInfo';
import Admin from './SchoolInfo/admin';
import './App.css';
import { WsClientProvider } from 'ws-request-hook';
import { useClientIdState } from './hooks/Wsclient';
import { KEYS } from './hooks/KEYS';
import { useEffect, useState } from 'react';
import { ControlMotor } from './components/Movement/MovementNew/Movement/ControlMotor.tsx';
import { Toaster } from 'react-hot-toast';
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const prod = import.meta.env.PROD;
export default function App() {
  const manageClientId = useClientIdState(KEYS.CLIENT_ID);
  const [clientId, setClientId] = useState(manageClientId.getClientId());
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
            <Route path="/school-info/admin/*" element={<Admin />} />
            <Route path="/school-info/*" element={<SchoolInfo />} />
            <Route path="/RobotMovement" element={<ControlMotor />} />
            <Route path="/tic-tac-toe" element={<UTTTPage />} />
            <Route path="/" element={<Navigate to="/school-info" replace />} />

          </Routes>
          <Toaster />
        </WsClientProvider>
      )}
    </>
  );
}
