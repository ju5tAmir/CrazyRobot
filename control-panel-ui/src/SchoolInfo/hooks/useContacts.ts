
import { useEffect, useState } from 'react';
import { ContactsClient, ContactDto } from '../../api/generated-client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const http = import.meta.env.VITE_API_HTTP_SCHEMA;
const API_URL =  http+ BASE_URL;

export function useContacts() {
    const [contacts, setContacts] = useState<ContactDto[]>([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        const client = new ContactsClient(API_URL);
        client.getAll().then(c => {
            setContacts(c ?? []);
            setLoading(false);
        });
    }, []);

    return { contacts, loading };
}
