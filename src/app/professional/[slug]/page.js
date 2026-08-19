import { redirect } from 'next/navigation';

export default function ProfessionalProfileAliasPage({ params }) {
  redirect(`/p/${encodeURIComponent(params.slug)}`);
}
