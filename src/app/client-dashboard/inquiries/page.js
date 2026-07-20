"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { fetchClientInquiries } from "@/lib/clientInquiriesClient";
import { clearUnread } from "@/store/proChatSlice";
import InquiriesOverview from "@/components/client/inquiries/InquiriesOverview";
import InquiryChatDrawer from "@/components/client/inquiries/InquiryChatDrawer";
import {
  getInquiryCounts,
  INQUIRIES_PER_PAGE,
} from "@/components/client/inquiries/inquiryUtils";

function ClientInquiriesPageContent() {
  const { isAuthenticated } = useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const authUser = useAppSelector((state) => state.auth.user);
  const unreadByThread = useAppSelector(
    (state) => state.proChat?.unreadByThread || {},
  );
  const myUserId = String(authUser?.id || authUser?._id || "").trim();
  const [activeFilter, setActiveFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeChatItem, setActiveChatItem] = useState(null);
  const deepLinkThreadId = String(searchParams?.get("thread") || "").trim();
  const [initialDeepLinkThreadId] = useState(() => deepLinkThreadId);

  const query = useQuery({
    queryKey: [
      "client-inquiries",
      token,
      activeFilter,
      currentPage,
      initialDeepLinkThreadId,
    ],
    enabled: Boolean(token),
    queryFn: () =>
      fetchClientInquiries({
      token,
      type: activeFilter,
      limit: INQUIRIES_PER_PAGE,
      page: currentPage,
        thread_id: initialDeepLinkThreadId,
    }),
    staleTime: 30_000,
  });

  const items = useMemo(
    () => (Array.isArray(query.data?.items) ? query.data.items : []),
    [query.data?.items],
  );
  const pagination = query.data?.pagination || {};
  const totalItems = Number(pagination?.total ?? items.length);
  const totalPages = Math.max(
    Number(
      pagination?.total_pages ||
        Math.ceil(totalItems / INQUIRIES_PER_PAGE) ||
        1,
    ),
    1,
  );
  const hasPrevPage = Boolean(
    pagination?.has_prev_page ?? currentPage > 1,
  );
  const hasNextPage = Boolean(
    pagination?.has_next_page ?? currentPage < totalPages,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  useEffect(() => {
    if (!query.isLoading && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, query.isLoading, totalPages]);

  useEffect(() => {
    const pageFromApi = Number(pagination?.page || 0);
    if (
      !query.isLoading &&
      pageFromApi > 0 &&
      pageFromApi !== currentPage
    ) {
      setCurrentPage(pageFromApi);
    }
  }, [currentPage, pagination?.page, query.isLoading]);

  useEffect(() => {
    if (!deepLinkThreadId || query.isLoading) return;
    const match = items.find(
      (item) => String(item?.thread_id || "").trim() === deepLinkThreadId,
    );
    if (!match) return;
    setActiveChatItem(match);
    dispatch(clearUnread({ threadId: deepLinkThreadId }));
  }, [deepLinkThreadId, dispatch, items, query.isLoading]);

  const counts = useMemo(
    () =>
      getInquiryCounts(
        items,
        query.data?.counts,
        query.data?.pagination?.total,
      ),
    [items, query.data?.counts, query.data?.pagination?.total],
  );

  if (!isAuthenticated) return null;

  return (
    <>
      <InquiriesOverview
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isFetching={query.isFetching}
        items={items}
        counts={counts}
        unreadByThread={unreadByThread}
        activeFilter={activeFilter}
        currentPage={currentPage}
        totalItems={totalItems}
        totalPages={totalPages}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        onFilterChange={setActiveFilter}
        onPageChange={setCurrentPage}
        onOpenChat={(item, threadId) => {
          if (threadId) dispatch(clearUnread({ threadId }));
          setActiveChatItem(item);
          if (threadId) {
            router.replace(
              `/client-dashboard/inquiries?thread=${encodeURIComponent(threadId)}`,
            );
          }
        }}
        onBrowseProperties={() => router.push("/client-dashboard/properties")}
        onViewRecommendations={() =>
          router.push("/professionals?recommended=1")
        }
      />
      <InquiryChatDrawer
        item={activeChatItem}
        token={token}
        myUserId={myUserId}
        onClose={() => {
          setActiveChatItem(null);
          if (String(searchParams?.get("thread") || "").trim()) {
            router.replace("/client-dashboard/inquiries");
          }
        }}
      />
    </>
  );
}

export default function ClientInquiriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          <Loader2 size={20} className="mr-2 animate-spin text-primary" />
          Loading inquiries...
    </div>
      }
    >
      <ClientInquiriesPageContent />
    </Suspense>
  );
}
