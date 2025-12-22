import AdminMenu from "@/components/AdminMenu";

export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-row min-h-screen">
      <AdminMenu />
      {children}
    </div>
  );
}
