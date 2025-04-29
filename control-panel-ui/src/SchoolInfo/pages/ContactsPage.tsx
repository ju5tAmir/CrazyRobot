
import { useState, useMemo } from 'react';
import { useContacts } from '../hooks/useContacts';
import ContactsToolbar from '../components/ContactsToolbar';
import ContactCard      from '../components/ContactCard';
import ContactListItem  from '../components/ContactListItem';

export default function ContactsPage() {
    const { contacts, loading } = useContacts();
    const [query, setQuery]     = useState('');
    const [view,  setView]      = useState<'grid'|'list'>('grid');
    const [dept,  setDept]      = useState('');

    const filtered = useMemo(
        () => contacts.filter(c =>
            (!query || c.name?.toLowerCase().includes(query.toLowerCase())) &&
            (!dept  || c.department === dept)
        ),
        [contacts, query, dept]
    );

    return (
        <>
            <ContactsToolbar
                query={query} onQueryChange={setQuery}
                view={view}   onViewChange={setView}
                department={dept} onDepartmentChange={setDept}
            />
            {loading ? (
                <div className="flex justify-center mt-10">
                    <span className="loading loading-spinner loading-lg"/>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center opacity-70">No contacts found.</div>
            ) : view === 'grid' ? (
                <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
                    {filtered.map(c => <ContactCard key={c.id} contact={c}/>)}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filtered.map(c => <ContactListItem key={c.id} contact={c}/>)}
                </div>
            )}
        </>
    );
}
