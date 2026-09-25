"use client";

import { useState } from "react";
import { useAdminSalesPipeline } from "@/hooks/useAdminApi";
import { useAdminCanWrite } from "@/hooks/useAdminPermissions";
import { ADMIN_PERMISSION } from "@/lib/adminPermissions";
import { AdminEmptyState, AdminErrorState, AdminPageHeader } from "@/components/admin/AdminUi";
import AdminPipelineBoard from "@/components/admin/AdminPipelineBoard";
import AdminVoiceAgentPanel from "@/components/admin/AdminVoiceAgentPanel";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

export default function AdminLeadsPage() {
  const { data, isLoading, isError, error, refetch } = useAdminSalesPipeline();
  const canWrite = useAdminCanWrite(ADMIN_PERMISSION.LEADS_WRITE);
  const items = data?.items || [];
  const [selectedId, setSelectedId] = useState("");
  const selected = items.find((item) => item.id === selectedId) || null;

  if (isLoading) return <WorkspaceLoader />;
  if (isError) {
    return (
      <AdminErrorState
        message={error?.message || "Could not load the subscription desk."}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Subscription desk"
        subtitle="Professionals and clients who are not on a plan. They arrive from a demo booking or a contact request. Call them to walk through Nesti’s tools and move them onto a subscription."
      />
      {items.length ? (
        <AdminPipelineBoard
          items={items}
          selectedId={selected?.id || ""}
          onSelect={(row) => setSelectedId(row.id)}
        />
      ) : (
        <AdminEmptyState
          title="No one to call yet"
          hint="When someone books a demo or sends a contact request and they are not already subscribed, they show up here."
        />
      )}
      {selected ? (
        <AdminVoiceAgentPanel
          key={selected.id}
          targetType="sales"
          targetId={selected.id}
          defaultPhone={selected.phone || ""}
          canWrite={canWrite}
          purpose={`Maya calls ${selected.name || "this person"}, explains the tools for ${String(selected.role || "their work").replaceAll("_", " ")}, and asks them to subscribe.`}
        />
      ) : null}
    </div>
  );
}
