
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { ThemeProvider } from './SchoolInfo/ThemeContext.tsx';
import {AuthProvider} from "./SchoolInfo/auth/AuthContext.tsx";
// import  {StrictMode} from "react";


createRoot(document.getElementById('root')!).render(
  //<StrictMode>
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
   //</StrictMode>
);
