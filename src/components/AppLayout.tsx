
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'; 
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger, SidebarRail } from '@/components/ui/sidebar';
import { LineChart, UploadCloud, Home, LogOut, BarChart3, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';

const AppLayout = () => {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (!mounted) {
    return null;
  }

  const links = [
    {
      href: '/',
      icon: <Home className="w-5 h-5" />,
      label: 'Home'
    },
    {
      href: '/input',
      icon: <UploadCloud className="w-5 h-5" />,
      label: 'Data Management'
    },
    {
      href: '/plot',
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Visualizations'
    }
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!session?.user.email) return 'U';
    
    const emailParts = session.user.email.split('@')[0].split('.');
    if (emailParts.length > 1) {
      return (emailParts[0][0] + emailParts[1][0]).toUpperCase();
    }
    return emailParts[0].substring(0, 2).toUpperCase();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#f8f9fc]">
        <Sidebar className="border-r border-border/60">
          <SidebarHeader className="px-3 py-5 flex items-center gap-2">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <LineChart className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Graphify</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground px-2">MENU</p>
                <SidebarTrigger />
              </div>
              <SidebarMenu>
                {links.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === link.href}
                      tooltip={link.label}
                      className="group sidebar-menu-item"
                    >
                      <a href={link.href} className={cn(
                        location.pathname === link.href ? "sidebar-menu-item active" : "sidebar-menu-item"
                      )}>
                        {link.icon}
                        <span>{link.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarContent>
          
          <SidebarFooter className="p-4 mt-auto">
            {session && (
              <div className="space-y-4">
                <Separator className="my-2" />
                <div className="flex items-center gap-3 px-2 py-2">
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium leading-none">
                      {session.user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm" 
                  onClick={handleSignOut}
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </SidebarFooter>
          
          {/* Add the rail handle for sidebar resizing */}
          <SidebarRail />
        </Sidebar>
        
        <SidebarInset className="bg-[#f8f9fc]">
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
