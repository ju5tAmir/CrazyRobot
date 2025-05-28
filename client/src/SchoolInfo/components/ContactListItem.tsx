
import { ContactDto } from '../../api/generated-client';

export default function ContactListItem({ contact }: { contact: ContactDto }) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-base-200">
            <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-10">
                    {contact.imageUrl ? (
                        <img src={contact.imageUrl} alt={contact.name} />
                    ) : (
                        contact.name?.[0] ?? '?'
                    )}
                </div>
            </div>
            <div className="flex-1">
                <div className="font-medium">{contact.name}</div>
                <div className="text-sm opacity-70">
                    {contact.role} &middot; {contact.department}
                </div>
            </div>
            <div className="text-sm opacity-80">{contact.phone}</div>
        </div>
    );
}
