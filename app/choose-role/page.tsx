"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChooseRole } from "@/page-components/ChooseRole";

export default function ChooseRolePage() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        redirect("/login");
    }

    return <ChooseRole />;
}
