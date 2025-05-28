import { useState, ChangeEvent, FormEvent } from 'react';
import { ContactsClient, ContactDto, FileParameter } from '../../../api/generated-client';
import { useAuth }               from '../../../helpers/useAuth.ts';

type Props = {
    initial : ContactDto;
    onSubmit: (dto: ContactDto) => void;   // ← void, не Promise
    onCancel: () => void;
};

export default function ContactForm({ initial, onSubmit, onCancel }: Props) {
    const [dto,  setDto]  = useState<ContactDto>(initial);
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const { jwt }         = useAuth();

    const api = new ContactsClient(import.meta.env.VITE_API_URL, {
        fetch : (u,i)=> fetch(u,{...i, headers:{...i?.headers, Authorization:`Bearer ${jwt}`}})
    });

    /* ───────── helpers ─────── */
    const handleText = (e: ChangeEvent<HTMLInputElement>) =>
        setDto({ ...dto, [e.target.name]: e.target.value });

    const handleFile = (e: ChangeEvent<HTMLInputElement>) =>
        setFile(e.target.files?.[0] ?? null);

    /* ───────── submit ──────── */
    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setBusy(true);

        let imageUrl = dto.imageUrl;

        if (file) {
            const fp: FileParameter = { data: file, fileName: file.name };
            const blobResp   = await api.uploadPhoto(fp);
            const json       = JSON.parse(await blobResp.data.text());
            imageUrl         = json.url as string;
        }

        onSubmit({ ...dto, imageUrl });
        setBusy(false);
    };

    /* ───────── JSX ─────────── */
    return (
        <form onSubmit={submit} className="flex flex-col gap-2">
            <input className="input input-bordered" name="name"       value={dto.name??''}
                   placeholder="Name"       onChange={handleText} required />
            <input className="input input-bordered" name="role"       value={dto.role??''}
                   placeholder="Role"       onChange={handleText}/>
            <input className="input input-bordered" name="department" value={dto.department??''}
                   placeholder="Department" onChange={handleText}/>
            <input className="input input-bordered" name="email"      value={dto.email??''}
                   placeholder="Email" type="email" onChange={handleText}/>
            <input className="input input-bordered" name="phone"      value={dto.phone??''}
                   placeholder="Phone"      onChange={handleText}/>

            <input type="file" accept="image/*"
                   className="file-input file-input-bordered"
                   onChange={handleFile}/>

            <button className="btn btn-primary" disabled={busy || !dto.name}>
                {busy ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
                Cancel
            </button>
        </form>
    );
}
