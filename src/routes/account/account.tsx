import {Separator} from "@/components/ui/separator";
import {SidebarNav} from "./sidebar-nav";
import {Outlet} from "react-router-dom";

const sidebarNavItems = [
  {
    href: "/account",
    title: "General",
  },
  {
    href: "/account/security",
    title: "Security",
  },
];

export function Account() {
  return (
    <div>
      <div className="space-y-0.5 py-6">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 pt-6">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
