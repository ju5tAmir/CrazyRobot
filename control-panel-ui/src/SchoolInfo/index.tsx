import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SchoolInfoLayout from './layout/SchoolInfoLayout';
import {ControlMotor} from "../components/Movement/MovementNew/Movement/ControlMotor.tsx";
import {UTTTPage} from "../components/UTTT/UTTTpage.tsx";
import ThreeDView from "../components/ThreeD/ThreeDView.tsx";

const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const EventsPage   = lazy(() => import('./pages/EventsPage'));
const SurveysPage   = lazy(() => import('../components/surveys/user/SurveysPageUser'));


export default function SchoolInfo() {
    return (
        <SchoolInfoLayout>
            <Suspense fallback={<span className="loading loading-spinner" />}>
                <Routes>
                    <Route path="/"            element={<Navigate to="contacts" replace />} />
                    <Route path="contacts"     element={<ContactsPage />} />
                    <Route path="events"       element={<EventsPage />} />
                    <Route path="surveys-user"       element={<SurveysPage />} />
                    <Route path="robot-movement" element={<ControlMotor />} />
                    <Route path="tic-tac-toe" element={<UTTTPage />} />
                    <Route path="/3d" element={<ThreeDView />} />
                </Routes>
            </Suspense>
        </SchoolInfoLayout>
    );
}
