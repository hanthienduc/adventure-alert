

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CloudSun, Bell, Settings, BarChart3, Mountain, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: CloudSun,
  },
  {
    title: "My Alerts",
    url: createPageUrl("Alerts"),
    icon: Bell,
  },
  {
    title: "Forecast",
    url: createPageUrl("Forecast"),
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <style>
          {`
            :root {
              --adventure-primary: #1e40af;
              --adventure-secondary: #f97316;
              --adventure-accent: #0ea5e9;
              --adventure-success: #22c55e;
              --adventure-warning: #f59e0b;
              --adventure-snow: #f1f5f9;
              --adventure-sky: #0ea5e9;
            }
          `}
        </style>
        
        <Sidebar className="border-r border-white/20 bg-white/80 backdrop-blur-md">
          <SidebarHeader className="border-b border-white/20 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Mountain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900">AdventureAlert</h2>
                <p className="text-sm text-blue-600 font-medium">AI Weather</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl py-3 px-4 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                            : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-4">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-3">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Alerts</span>
                    <span className="font-bold text-blue-600">3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Perfect Days</span>
                    <span className="font-bold text-orange-600">2</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupContent>
                <div className="px-2 py-3">
                  <Link to={createPageUrl("Subscription")}>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg hover:shadow-xl transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-6 h-6" />
                        <h4 className="font-bold text-lg">Go Pro</h4>
                      </div>
                      <p className="text-sm opacity-90">Unlock AI Insights & more advanced features!</p>
                    </div>
                  </Link>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-white/20 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-700 font-semibold text-sm">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">Adventurer</p>
                <p className="text-xs text-gray-500 truncate">Ready for adventure</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-md border-b border-white/20 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-blue-50 p-2 rounded-xl transition-colors duration-200" />
              <h1 className="text-xl font-bold text-gray-900">AdventureAlert AI</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

