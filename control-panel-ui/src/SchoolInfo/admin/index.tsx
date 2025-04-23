
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout   from './layout/AdminLayout';
import ContactsAdmin from './pages/ContactsAdmin';
import EventsAdmin   from './pages/EventsAdmin';

export default function Admin() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="contacts" replace />} />
                <Route path="contacts" element={<ContactsAdmin />} />
                <Route path="events"   element={<EventsAdmin />} />
            </Route>
        </Routes>
    );
}
