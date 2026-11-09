import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { UserDashboardSidebar } from "@/components/user-dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <UserDashboardSidebar />
          <div className="flex-1 w-full min-w-0">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
