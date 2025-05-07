// src/SchoolInfo/layout/SchoolInfoLayout.tsx
import { PropsWithChildren, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function SchoolInfoLayout({ children }: PropsWithChildren) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const openSidebar = () => setSidebarOpen(true);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="flex h-screen bg-base-200">
            <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header openSidebar={openSidebar} />
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
