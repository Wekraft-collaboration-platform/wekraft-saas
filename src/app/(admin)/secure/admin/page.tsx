"use client";

import React from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import AdminDashboard from "@/modules/admin/AdminDashboard";

const AdminPage = () => {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
};

export default AdminPage;


