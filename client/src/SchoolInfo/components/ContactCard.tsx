/* src/SchoolInfo/components/ContactCard.tsx */
import { ContactDto } from '../../api/generated-client';
import { Mail, Phone } from 'lucide-react';

export default function ContactCard({ contact }: { contact: ContactDto }) {
    return (
        <div
            className="
        card bg-base-100 shadow-sm rounded-lg
        transition-transform duration-200
        md:hover:shadow-lg md:hover:scale-[1.03]
        focus-within:shadow-lg focus-within:scale-[1.03]
        w-full
      "
        >

            <div className="card-body min-h-[260px] flex flex-col gap-4 p-6">


                <div className="flex items-center gap-5">
                    <div className="avatar shrink-0">
                        <div
                            className="
                w-20 h-20 md:w-24 md:h-24 rounded-full
                bg-neutral text-neutral-content
                grid place-content-center overflow-hidden
              "
                        >
                            {contact.imageUrl ? (
                                <img
                                    src={contact.imageUrl}
                                    alt={contact.name ?? 'photo'}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span className="font-semibold text-2xl select-none">
                  {contact.name?.[0] ?? '?'}
                </span>
                            )}
                        </div>
                    </div>

                    <div className="min-w-0">

                        <h2 className="card-title text-lg md:text-xl leading-tight break-words">
                            {contact.name}
                        </h2>
                        <p className="text-sm md:text-base opacity-70 break-words">
                            {contact.role}
                        </p>
                    </div>
                </div>


                {contact.department && (
                    <div className="badge badge-outline w-max text-sm md:text-base">
                        {contact.department}
                    </div>
                )}

                {/* ─── Email / Phone ───────────────────────────── */}
                <div className="mt-auto text-sm md:text-base flex flex-col gap-1 opacity-80 break-words">
                    {contact.email && (
                        <span className="flex items-center gap-1">
              <Mail size={16} className="shrink-0 text-base-content/70" />
                            {contact.email}
            </span>
                    )}
                    {contact.phone && (
                        <span className="flex items-center gap-1">
              <Phone size={16} className="shrink-0 text-base-content/70" />
                            {contact.phone}
            </span>
                    )}
                </div>
            </div>
        </div>
    );
}
