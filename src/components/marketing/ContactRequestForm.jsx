"use client";

import { useState } from "react";
import { apiClient, API_ENDPOINTS } from "@/lib/api";

const ROLES = [
  { value: "agent", label: "Real estate agent" },
  { value: "mortgage_broker", label: "Mortgage broker" },
  { value: "lawyer", label: "Lawyer" },
  { value: "client", label: "Client" },
];

export default function ContactRequestForm() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    interest_role: "agent",
    source: "demo",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setStatus("");
    try {
      await apiClient({
        url: API_ENDPOINTS.billing.enterpriseInquiry,
        method: "POST",
        data: form,
      });
      setStatus("Request received. A Nesti specialist will follow up.");
      setForm({ full_name: "", email: "", phone: "", interest_role: "agent", source: "demo", message: "" });
    } catch (error) {
      setStatus(error?.message || "Could not send that request.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-3">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-background-light/60 p-1 text-sm font-semibold">
        <button type="button" className={`rounded-lg px-3 py-2 ${form.source === "demo" ? "bg-white text-text-heading shadow-sm" : "text-text-muted"}`} onClick={() => update("source", "demo")}>Book a demo</button>
        <button type="button" className={`rounded-lg px-3 py-2 ${form.source === "contact" ? "bg-white text-text-heading shadow-sm" : "text-text-muted"}`} onClick={() => update("source", "contact")}>Contact request</button>
      </div>
      <input required className="rounded-xl border border-border px-3 py-2 text-sm" placeholder="Full name" value={form.full_name} onChange={(event) => update("full_name", event.target.value)} />
      <input required type="email" className="rounded-xl border border-border px-3 py-2 text-sm" placeholder="Email" value={form.email} onChange={(event) => update("email", event.target.value)} />
      <input required className="rounded-xl border border-border px-3 py-2 text-sm" placeholder="Phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
      <select className="rounded-xl border border-border px-3 py-2 text-sm" value={form.interest_role} onChange={(event) => update("interest_role", event.target.value)}>
        {ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
      </select>
      <textarea className="min-h-20 rounded-xl border border-border px-3 py-2 text-sm" placeholder="What do you want to use Nesti for?" value={form.message} onChange={(event) => update("message", event.target.value)} />
      <button type="submit" disabled={pending} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Sending…" : form.source === "demo" ? "Request a demo" : "Send request"}
      </button>
      {status ? <p className="text-xs text-text-body">{status}</p> : null}
    </form>
  );
}
