import { PropsWithChildren, useState } from 'react';

import Sidebar from '../../layout/Sidebar';
import Header  from '../../layout/Header';

export default function AdminLayout({children}: PropsWithChildren) {

    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const openSidebar = () => setSidebarOpen(true);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="flex h-screen bg-base-200">
            <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header openSidebar={openSidebar} />
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
