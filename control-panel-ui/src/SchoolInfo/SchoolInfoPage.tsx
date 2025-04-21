// src/pages/user/SchoolInfoPage.tsx
import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import {ContactDto, ContactsClient, EventDto, EventsClient} from '../../api/generated-client';
 import dayjs from 'dayjs';
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export const SchoolInfoPage: React.FC = () => {
    const [contacts, setContacts] = useState<ContactDto[]>([]);
    const [events, setEvents] = useState<EventDto[]>([]);
    const [loading, setLoading] = useState<{ contacts: boolean; events: boolean }>({ contacts: false, events: false });
    const [search, setSearch] = useState('');
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [deptFilter, setDeptFilter] = useState<string>('All');
    // const auth = useAuth(); // якщо тобі потрібен JWT

    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    const contactsClient = new ContactsClient(apiBase);
    const eventsClient   = new EventsClient(apiBase);

    // Завантаження даних
    useEffect(() => {
        setLoading(l => ({ ...l, contacts: true }));
        contactsClient.getAll()
            .then(data => setContacts(data || []))
            .finally(() => setLoading(l => ({ ...l, contacts: false })));

        setLoading(l => ({ ...l, events: true }));
        eventsClient.getAll()
            .then(data => setEvents(data || []))
            .finally(() => setLoading(l => ({ ...l, events: false })));
    }, []);

    // Фільтрація + пошук контактів
    const filteredContacts = contacts
        .filter(c =>
            (deptFilter === 'All' || c.department === deptFilter) &&
            (!search || c.name?.toLowerCase().includes(search.toLowerCase()))
        );

    // Унікальні департаменти
    const departments = Array.from(new Set(contacts.map(c => c.department))).filter(d => !!d);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">School Information Portal</h1>

            <Tab.Group>
                <Tab.List className="flex space-x-2 border-b">
                    {['Contacts', 'Events'].map(tab => (
                        <Tab key={tab}
                             className={({ selected }) =>
                                 classNames(
                                     'px-4 py-2 rounded-t-lg',
                                     selected ? 'bg-white border-t border-l border-r border-gray-200' : 'text-gray-500 hover:bg-gray-100'
                                 )
                             }>
                            {tab}
                        </Tab>
                    ))}
                </Tab.List>

                <Tab.Panels className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-4">
                    {/* === Contacts Tab === */}
                    <Tab.Panel>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    className="px-3 py-2 border rounded-md focus:ring"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <select
                                    className="px-3 py-2 border rounded-md focus:ring"
                                    value={deptFilter}
                                    onChange={e => setDeptFilter(e.target.value)}
                                >
                                    <option value="All">All Departments</option>
                                    {departments.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setViewType('grid')}
                                    className={classNames('px-3 py-1 rounded-md', viewType === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100')}
                                >
                                    Grid View
                                </button>
                                <button
                                    onClick={() => setViewType('list')}
                                    className={classNames('px-3 py-1 rounded-md', viewType === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100')}
                                >
                                    List View
                                </button>
                            </div>
                        </div>

                        {loading.contacts ? (
                            <p>Loading contacts…</p>
                        ) : viewType === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredContacts.map(c => (
                                    <div key={c.id} className="p-4 border rounded-md shadow-sm">
                                        <h3 className="font-semibold">{c.name}</h3>
                                        <p className="text-sm text-gray-500">{c.role}</p>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded text-xs">{c.department}</span>
                                        <div className="mt-3 text-sm space-y-1">
                                            <p>📧 {c.email}</p>
                                            <p>📞 {c.phone}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {filteredContacts.map(c => (
                                    <li key={c.id} className="p-3 border rounded-md flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold">{c.name}</h3>
                                            <p className="text-sm text-gray-500">{c.role} — {c.department}</p>
                                        </div>
                                        <div className="text-sm space-y-1">
                                            <p>📧 {c.email}</p>
                                            <p>📞 {c.phone}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Tab.Panel>

                    {/* === Events Tab === */}
                    <Tab.Panel>
                        {loading.events ? (
                            <p>Loading events…</p>
                        ) : (
                            <ul className="space-y-4">
                                {events.map(evt => (
                                    <li key={evt.id} className="p-4 border rounded-md">
                                        <h3 className="font-semibold text-lg">{evt.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {evt.date ? dayjs(evt.date).format('DD MMM YYYY') : '—'}
                                        </p>
                                        <p className="mt-2">{evt.description}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};
