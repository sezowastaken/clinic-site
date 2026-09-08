import { Outlet } from "react-router-dom";
import SiteHeader from "../shared/SiteHeader";
import SiteFooter from "../shared/SiteFooter";

export default function SiteLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg)] text-charcoal antialiased">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
