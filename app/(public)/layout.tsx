"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/AuthContext";
import Loader from "@/components/Loader";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isExempt = pathname === "/preview";

  useEffect(() => {
    if (!loading && user && !isExempt) {
      router.replace("/heists");
    }
  }, [loading, user, isExempt, router]);

  if (loading || (user && !isExempt)) return <Loader />;

  return <main className="public">{children}</main>;
}
