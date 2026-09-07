import AppChromeShell from "../AppChromeShell";
import CallTranscriptionConsentModal from "@/components/prochat/calls/CallTranscriptionConsentModal";

export default function AppLayout({ children }) {
  return (
    <>
      <AppChromeShell>{children}</AppChromeShell>
      <CallTranscriptionConsentModal />
    </>
  );
}
