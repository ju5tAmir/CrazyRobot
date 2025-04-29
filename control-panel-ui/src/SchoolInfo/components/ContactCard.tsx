
import { ContactDto } from '../../api/generated-client';

export default function ContactCard({ contact }: { contact: ContactDto }) {
    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4 gap-2">
                <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-12">
                            {contact.imageUrl ? (
                                <img src={contact.imageUrl} alt={contact.name} />
                            ) : (
                                contact.name?.[0] ?? '?'
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="card-title text-base">{contact.name}</h2>
                        <p className="text-sm opacity-70">{contact.role}</p>
                    </div>
                </div>
                <div className="badge badge-outline">{contact.department}</div>
                <div className="text-sm flex flex-col gap-1 opacity-80">
          <span className="flex items-center gap-1">
            <i className="icon-[lucide--mail] w-4 h-4" />
              {contact.email}
          </span>
                    <span className="flex items-center gap-1">
            <i className="icon-[lucide--phone] w-4 h-4" />
                        {contact.phone}
          </span>
                </div>
            </div>
        </div>
    );
}
