
import { useState, useMemo } from 'react';
import { useEvents }   from '../hooks/useEvents';
import EventsToolbar   from '../components/EventsToolbar';
import EventCard       from '../components/EventCard';
import EventListItem   from '../components/EventListItem';

export default function EventsPage() {
    const { events, loading }   = useEvents();
    const [query, setQuery]     = useState('');
    const [view,  setView]      = useState<'grid'|'list'>('grid');
    const [cat,   setCat]       = useState('');
    const [status,setStatus]    = useState<string>('');

    const filtered = useMemo(
        () => events.filter(e =>
            (!query  || e.title?.toLowerCase().includes(query.toLowerCase())) &&
            (!cat    || e.category === cat) &&
            (!status || String(e.status) === status)
        ),
        [events, query, cat, status]
    );

    return (
        <>
            <EventsToolbar
                query={query} onQueryChange={setQuery}
                view={view}   onViewChange={setView}
                category={cat} onCategoryChange={setCat}
                status={status} onStatusChange={setStatus}
            />
            {loading ? (
                <div className="flex justify-center mt-10">
                    <span className="loading loading-spinner loading-lg"/>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center opacity-70">No events found.</div>
            ) : view === 'grid' ? (
                <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
                    {filtered.map(e => <EventCard key={e.id} event={e}/>)}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filtered.map(e => <EventListItem key={e.id} event={e}/>)}
                </div>
            )}
        </>
    );
}
