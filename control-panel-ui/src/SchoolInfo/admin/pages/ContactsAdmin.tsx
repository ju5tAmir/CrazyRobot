import { useEffect, useState }   from 'react';
import { ContactDto, ContactsClient } from '../../../api/generated-client';
import ContactForm               from '../../components/forms/ContactForm';
import { useAuth }               from '../../auth/AuthContext';

export default function ContactsAdmin() {
    const { jwt } = useAuth();


    const client = new ContactsClient(import.meta.env.VITE_API_URL, {
        fetch: (url, init) =>
            fetch(url, {
                ...init,
                headers: { ...init?.headers, Authorization: `Bearer ${jwt}` }
            })
    });

    const [list,    setList]  = useState<ContactDto[]>([]);
    const [editing, setEdit]  = useState<ContactDto | null>(null);

    useEffect(() => { refresh(); }, []);
    const refresh = () => client.getAll().then(c => setList(c ?? []));

    function save(dto: ContactDto) {
        const op = dto.id ? client.update(dto.id, dto) : client.create(dto);
        op.then(refresh);
        setEdit(null);
    };

    const del = async (id?: string) => {
        if (!id) return;
        await client.delete(id);
        refresh();
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Contacts</h1>
                <button className="btn btn-primary" onClick={() => setEdit({} as ContactDto)}>
                    + New
                </button>
            </div>

            <table className="table table-zebra w-full">
                <thead>
                <tr><th>Name</th><th>Role</th><th>Email</th><th/></tr>
                </thead>
                <tbody>
                {list.map(c => (
                    <tr key={c.id}>
                        <td>{c.name}</td><td>{c.role}</td><td>{c.email}</td>
                        <td className="flex gap-2">
                            <button className="btn btn-sm"           onClick={() => setEdit(c)}>Edit</button>
                            <button className="btn btn-sm btn-error" onClick={() => del(c.id)}>Del</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>


            {editing && (
                <dialog className="modal modal-open">
                    <div className="modal-box w-96">
                        <h3 className="font-bold mb-2">
                            {editing.id ? 'Edit' : 'New'} contact
                        </h3>

                        <ContactForm
                            initial={editing}
                            onSubmit={save}
                            onCancel={() => setEdit(null)}
                        />

                        <div className="modal-action">
                            <button className="btn" onClick={() => setEdit(null)}>Cancel</button>
                        </div>
                    </div>
                </dialog>
            )}
        </>
    );
}
