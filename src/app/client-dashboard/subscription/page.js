"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import {
  Loader2,
} from "lucide-react";
import ClientSubscriptionPanel from "@/components/client/ClientSubscriptionPanel";
import { toast } from "react-toastify";

export default function ClientSubscriptionPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Handle authentication and role checks
  useEffect(() => {
    if (!hydrated) return;
    
    // Check authentication
    if (!token) {
      router.push('/log-in');
      return;
    }
    
    // Verify user is a client
    if (user?.role && user.role !== 'client') {
      router.push('/dashboard');
      return;
    }
    
    fetchSubscription();
  }, [hydrated, token, user?.role]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/subscription/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSubscription(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary sm:h-12 sm:w-12" />
          <p className="mt-4 text-sm text-gray-600 sm:text-base">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(52,199,89,0.18),transparent_30%),linear-gradient(135deg,#F3FBF6_0%,#EAF8EF_42%,#F8FFFB_100%)] px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        {/* Subscription Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ClientSubscriptionPanel
            subscription={subscription}
            onSubscriptionChange={fetchSubscription}
            token={token}
          />
        </motion.div>

      </div>
    </div>
  );
}
