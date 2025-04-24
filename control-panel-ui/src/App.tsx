// src/App.tsx
import {  Navigate, Route, Routes } from 'react-router-dom';
import Motor      from './components/Movement/Motor';
import { UTTTPage } from './components/UTTT/UTTTpage';
import SchoolInfo from './SchoolInfo';
import Admin      from './SchoolInfo/admin';
import './App.css';

export default function App() {
    return (

        <Routes>
            <Route path="/school-info/admin/*" element={<Admin />} />
            <Route path="/school-info/*"       element={<SchoolInfo />} />
            <Route path="/RobotMovement"       element={<Motor />} />
            <Route path="/tic-tac-toe"         element={<UTTTPage />} />
            <Route path="/"                    element={<Navigate to="/school-info" replace />} />
        </Routes>

    );
}
