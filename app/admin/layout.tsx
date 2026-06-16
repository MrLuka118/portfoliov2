import type { Metadata } from "next";

import { AdminProviders } from "@/components/admin/admin-providers";

export const metadata: Metadata = {
  title: "Admin · Luka Photography",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProviders>
      <div className="min-h-screen bg-background">{children}</div>
    </AdminProviders>
  );
}
