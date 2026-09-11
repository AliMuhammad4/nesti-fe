import { redirect } from 'next/navigation';

export default function ProfessionalContactAliasPage({ params }) {
  redirect(`/p/${encodeURIComponent(params.slug)}/contact`);
}
