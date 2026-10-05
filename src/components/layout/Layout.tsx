import { Header } from "./Header";
import Sidebar from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-canvas flex h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="app-canvas min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
