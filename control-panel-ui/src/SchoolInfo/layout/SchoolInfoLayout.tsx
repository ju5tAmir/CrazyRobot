
import { PropsWithChildren } from 'react';
import Sidebar from './Sidebar';
import Header  from './Header';

export default function SchoolInfoLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex h-screen bg-base-200">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    );
}
