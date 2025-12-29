import AdminMenu from "@/components/AdminMenu";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <AdminMenu />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
