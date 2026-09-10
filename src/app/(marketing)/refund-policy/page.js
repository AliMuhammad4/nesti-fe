import RefundPolicyPage from "@/components/public-pages/RefundPolicyPage";

export const metadata = {
  title: {
    absolute: "Refund Policy | Nesti AI",
  },
  description:
    "Learn about Nesti AI's refund policy, including cancellation terms, billing cycles, and eligibility for subscription refunds.",
  alternates: {
    canonical: "https://nesti.ca/refund-policy",
  },
  openGraph: {
    title: "Refund Policy | Nesti AI",
    description:
      "Learn about Nesti AI's refund policy, including cancellation terms, billing cycles, and eligibility for subscription refunds.",
    url: "https://nesti.ca/refund-policy",
  },
  twitter: {
    title: "Refund Policy | Nesti AI",
    description:
      "Learn about Nesti AI's refund policy, including cancellation terms, billing cycles, and eligibility for subscription refunds.",
  },
};

export default function RefundPolicyRoute() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-background-light/20 to-white">
      <RefundPolicyPage />
    </div>
  );
}
