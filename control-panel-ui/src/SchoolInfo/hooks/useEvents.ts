
import { useEffect, useState } from 'react';
import { EventsClient, EventDto } from '../../api/generated-client';

const API_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function useEvents() {
    const [events, setEvents]   = useState<EventDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const client = new EventsClient(API_URL);
        client.getAll().then(e => {
            setEvents(e ?? []);
            setLoading(false);
        });
    }, []);

    return { events, loading };
}
