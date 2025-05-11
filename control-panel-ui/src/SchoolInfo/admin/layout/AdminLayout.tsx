// src/SchoolInfo/pages/admin/AdminLayout.tsx
import { useState } from 'react';
import { Outlet }   from 'react-router-dom';

import Sidebar from '../../layout/Sidebar';
import Header  from '../../layout/Header';

export default function AdminLayout() {

    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-base-200">
            {/* ─────────────  Sidebar  ───────────── */}
            <Sidebar
                isOpen={isSidebarOpen}
                closeSidebar={() => setSidebarOpen(false)}
            />

            {/* ─────────────  Right side  ───────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header із бургер-кнопкою (видно тільки на mobile) */}
                <Header openSidebar={() => setSidebarOpen(true)} />

                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
