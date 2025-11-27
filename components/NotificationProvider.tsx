"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "next-auth";

interface NotificationContextType {
  unreadCount: number;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({
  children,
  session
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const notifications = await response.json();
        const unread = notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      refreshNotifications();
    }
  }, [session]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}