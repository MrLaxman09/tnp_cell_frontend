 import { useState } from "react";
 import { Outlet } from "react-router-dom";
 import AdminSidebar from "@/components/admin/AdminSidebar";
 import { cn } from "@/lib/utils";
 import { Button } from "@/components/ui/button";
 import { Menu, X } from "lucide-react";
 
 const AdminLayout = () => {
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
   const [sidebarOpen, setSidebarOpen] = useState(false);
 
   return (
     <div className="min-h-screen bg-background">
       {/* Mobile menu button */}
       <div className="lg:hidden fixed top-4 left-4 z-50">
         <Button
           variant="outline"
           size="icon"
           onClick={() => setSidebarOpen(!sidebarOpen)}
           className="bg-background shadow-md"
         >
           {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
         </Button>
       </div>

       {/* Mobile overlay */}
       {sidebarOpen && (
         <div 
           className="lg:hidden fixed inset-0 bg-black/50 z-40"
           onClick={() => setSidebarOpen(false)}
         />
       )}
       
       <AdminSidebar 
         collapsed={sidebarCollapsed} 
         onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
         isOpen={sidebarOpen}
         onClose={() => setSidebarOpen(false)}
       />
       <main 
         className={cn(
           "transition-all duration-300 min-h-screen pt-16 lg:pt-0",
           // Mobile: no margin, Desktop: margin based on sidebar state
           sidebarCollapsed ? "lg:ml-16" : "lg:ml-64",
           "px-4 lg:px-8 py-6"
         )}
       >
         <Outlet />
       </main>
     </div>
   );
 };
 
 export default AdminLayout;
