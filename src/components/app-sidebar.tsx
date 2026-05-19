import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Factory, Boxes, ShoppingCart, ClipboardList,
  Truck, Wrench, ShieldCheck, Users, BarChart3, RotateCcw,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { resetSeed } from "@/lib/spf-store";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Production", url: "/production", icon: Factory },
  { title: "Inventory", url: "/inventory", icon: Boxes },
  { title: "Procurement", url: "/procurement", icon: ShoppingCart },
  { title: "Sales Orders", url: "/sales", icon: ClipboardList },
  { title: "Deliveries", url: "/deliveries", icon: Truck },
  { title: "Machines", url: "/machines", icon: Wrench },
  { title: "Quality", url: "/quality", icon: ShieldCheck },
  { title: "Workforce", url: "/workforce", icon: Users },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold">
            S
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">SPF-OMS</span>
            <span className="text-xs text-muted-foreground">Swan Paper Fabrics</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.url}>
                  <SidebarMenuButton asChild isActive={currentPath === it.url} tooltip={it.title}>
                    <Link to={it.url}>
                      <it.icon className="h-4 w-4" />
                      <span>{it.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { if (confirm("Reset all data to seed?")) resetSeed(); }}
          className="justify-start gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Reset demo data</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
