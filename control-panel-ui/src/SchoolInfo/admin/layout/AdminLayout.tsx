
import { Outlet } from 'react-router-dom';
import Sidebar from '../../layout/Sidebar';

export default function AdminLayout() {
    return (
        <div className="flex h-screen bg-base-200">
            <Sidebar />
            <main className="flex-1 p-6 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
