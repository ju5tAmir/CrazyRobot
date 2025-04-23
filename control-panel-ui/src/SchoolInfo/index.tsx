import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SchoolInfoLayout from './layout/SchoolInfoLayout';

const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const EventsPage   = lazy(() => import('./pages/EventsPage'));


export default function SchoolInfo() {
    return (
        <SchoolInfoLayout>
            <Suspense fallback={<span className="loading loading-spinner" />}>
                <Routes>
                    <Route path="/"        element={<Navigate to="contacts" replace />} />
                    <Route path="contacts" element={<ContactsPage />} />
                    <Route path="events"   element={<EventsPage />} />

                </Routes>
            </Suspense>
        </SchoolInfoLayout>
    );
}
