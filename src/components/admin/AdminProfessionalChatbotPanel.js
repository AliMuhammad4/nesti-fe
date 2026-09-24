"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Link as LinkIcon, Pause, Play, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  useAdminDeleteProfessionalChatbotEmbed,
  useAdminGenerateProfessionalChatbotEmbed,
  useAdminPatchProfessionalChatbotEmbed,
  useAdminProfessionalChatbotEmbeds,
} from "@/hooks/useAdminApi";
import { AdminConfirmModal, AdminEmptyState, AdminErrorState } from "@/components/admin/AdminUi";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";
import { useAdminCanWrite } from "@/hooks/useAdminPermissions";
import { ADMIN_PERMISSION } from "@/lib/adminPermissions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function getSiteOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "";
}

/**
 * Admin Chatbot tab — same embed management as Settings → Chatbot,
 * scoped to this professional via admin APIs.
 */
export default function AdminProfessionalChatbotPanel({
  professionalId,
  professionalRole = "",
}) {
  const canWrite = useAdminCanWrite(ADMIN_PERMISSION.PROFESSIONALS_WRITE);
  const [newName, setNewName] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError, error, isFetching, refetch } =
    useAdminProfessionalChatbotEmbeds(professionalId);
  const generateMutation = useAdminGenerateProfessionalChatbotEmbed();
  const patchMutation = useAdminPatchProfessionalChatbotEmbed();
  const deleteMutation = useAdminDeleteProfessionalChatbotEmbed();

  const embeds = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.embeds)) return data.embeds;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const renderSnippetRow = (label, value, copyKey, tone = "light") => (
    <div
      className={`border-t border-slate-200 px-4 py-3 ${
        tone === "muted" ? "bg-slate-50/80" : "bg-white"
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <button
          type="button"
          onClick={() => handleCopy(value, copyKey)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
          title={`Copy ${label}`}
          aria-label={`Copy ${label}`}
        >
          {copiedKey === copyKey ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <code className="whitespace-nowrap font-mono text-[11px] leading-relaxed text-slate-700">
          {value}
        </code>
      </div>
    </div>
  );

  const buildScriptSnippet = (embed) => {
    const tokenValue = embed?.unique_token || embed?.token || embed?._id || embed?.id;
    const origin = getSiteOrigin() || API_BASE;
    return `<script src="${origin}/chatbot/widget.js?token=${tokenValue}"></script>`;
  };

  const onGenerate = () => {
    if (!canWrite) return;
    const payload = {};
    const role = String(professionalRole || "").trim();
    if (role) payload.widget_role = role;
    const name = String(newName || "").trim();
    if (name) payload.widget_settings = { display_name: name };
    generateMutation.mutate(
      { professionalId, data: payload },
      {
        onSuccess: (resp) => {
          if (resp?.reused) {
            toast.info("Existing embed link reused. Delete it first if you need a new token.");
          } else {
            toast.success("Embed link generated");
          }
          setNewName("");
        },
        onError: (err) => toast.error(err?.message || "Failed to generate"),
      },
    );
  };

  if (!professionalId) {
    return (
      <AdminEmptyState
        title="No professional selected"
        hint="Open a professional profile to manage their chatbot embed."
      />
    );
  }

  if (isLoading) return <WorkspaceLoader />;
  if (isError) {
    return (
      <AdminErrorState
        message={error?.message || "Failed to load chatbot embeds"}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">Chatbot embed</h3>
        <p className="mt-1 text-xs text-slate-500">
          Same embed links this professional manages under Settings → Chatbot. Generate, pause, or
          delete on their behalf.
        </p>
      </div>

      {canWrite && !embeds.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <div className="mb-1 text-sm font-semibold text-slate-900">Generate new embed link</div>
              <p className="mb-2 text-xs text-slate-500">
                Create a shareable chatbot URL and ready-to-use code snippets.
              </p>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Optional name, e.g. Website Chatbot"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <button
              type="button"
              onClick={onGenerate}
              disabled={generateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generateMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                "Generate link"
              )}
            </button>
          </div>
        </div>
      ) : embeds.length ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
          One embed token is allowed per account. Delete the current token before generating a new
          one.
        </div>
      ) : null}

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <div className="text-sm font-semibold text-slate-900">Embed links</div>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage status, preview link, and copy integration snippets.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {!embeds.length ? (
        <AdminEmptyState
          title="No embed links yet"
          hint="Generate one to get a public chatbot URL and embed snippet for this professional."
        />
      ) : (
        <div className="space-y-4">
          {embeds.map((embed) => {
            const embedDocId = embed?._id || embed?.id;
            const tokenValue = embed?.unique_token || embed?.token;
            const origin = getSiteOrigin() || API_BASE;
            const publicUrl = `${origin}/chatbot/${tokenValue}`;
            const codeSnippet = buildScriptSnippet(embed);
            const iframeSnippet = `<iframe src="${publicUrl}" style="width:100%;height:100%;border:none;"></iframe>`;
            const providedSnippet = embed?.embed_code || "";
            const active = embed?.is_active !== false;
            const createdAtValue = embed?.created_at || embed?.createdAt || null;

            return (
              <div
                key={`embed-${embedDocId || tokenValue}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-slate-900">
                        {embed?.widget_settings?.display_name || "Website Chatbot"}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          active
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <div
                        className="inline-flex max-w-full items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1"
                        title={tokenValue}
                      >
                        <span className="font-semibold text-slate-500">Token</span>
                        <span className="max-w-[22rem] truncate font-mono text-[11px] text-slate-700">
                          {tokenValue}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1">
                        <span className="font-semibold text-slate-500">Widget</span>
                        <span className="font-medium capitalize text-slate-700">
                          {embed?.widget_role || "agent"}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1">
                        <span className="font-semibold text-slate-500">Created</span>
                        <span className="text-slate-700">
                          {createdAtValue ? new Date(createdAtValue).toLocaleString() : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {canWrite ? (
                    <div className="flex items-center gap-2 self-start">
                      <button
                        type="button"
                        onClick={() =>
                          patchMutation.mutate(
                            {
                              professionalId,
                              embedId: embedDocId,
                              data: { is_active: !active },
                            },
                            {
                              onSuccess: () =>
                                toast.success(active ? "Embed paused" : "Embed activated"),
                              onError: (err) => toast.error(err?.message || "Update failed"),
                            },
                          )
                        }
                        disabled={patchMutation.isPending}
                        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                          active
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        {active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {active ? "Pause" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ embedDocId, tokenValue })}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/60 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <div className="truncate text-xs text-slate-600 md:max-w-[70%]" title={publicUrl}>
                    {publicUrl}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(publicUrl, `url-${tokenValue}`)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-50"
                    >
                      {copiedKey === `url-${tokenValue}` ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <LinkIcon className="h-4 w-4" />
                      )}
                      Copy link
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {renderSnippetRow("Embed snippet", codeSnippet, `code-${tokenValue}`, "light")}
                {providedSnippet
                  ? renderSnippetRow(
                      "Provided embed code",
                      providedSnippet,
                      `provided-${tokenValue}`,
                      "muted",
                    )
                  : null}
                {renderSnippetRow("Iframe snippet", iframeSnippet, `iframe-${tokenValue}`, "light")}
              </div>
            );
          })}
        </div>
      )}

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete chatbot embed?"
        subtitle={deleteTarget?.tokenValue ? `Token ${deleteTarget.tokenValue}` : undefined}
        message="This permanently removes the embed token. Existing website snippets will stop working."
        confirmLabel="Delete embed"
        tone="danger"
        pending={deleteMutation.isPending}
        onConfirm={() =>
          deleteMutation.mutate(
            { professionalId, embedId: deleteTarget?.embedDocId },
            {
              onSuccess: () => {
                toast.success("Embed deleted");
                setDeleteTarget(null);
              },
              onError: (err) => toast.error(err?.message || "Delete failed"),
            },
          )
        }
      />
    </div>
  );
}
