import { redirect } from 'next/navigation';

export default function ProfessionalPropertiesAliasPage({ params }) {
  redirect(`/p/${encodeURIComponent(params.slug)}/properties`);
}
