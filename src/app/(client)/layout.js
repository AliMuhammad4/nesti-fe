import AppChromeShell from "../AppChromeShell";
import CallTranscriptionConsentModal from "@/components/prochat/calls/CallTranscriptionConsentModal";

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary/[0.05] to-white">
      <AppChromeShell>{children}</AppChromeShell>
      <CallTranscriptionConsentModal />
    </div>
  );
}
