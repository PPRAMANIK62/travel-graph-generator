
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LineChart, UploadCloud, Home, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { motion } from 'framer-motion';
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  Logo,
  LogoIcon,
  useSidebar
} from '@/components/ui/sidebar-new';

const AppLayout = () => {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="flex min-h-screen w-full bg-[#f8f9fc]">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="py-4">
              {sidebarOpen ? <Logo /> : <LogoIcon />}
            </div>
            
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link) => (
                <SidebarLink 
                  key={link.href}
                  link={link}
                  active={location.pathname === link.href}
                />
              ))}
            </div>
          </div>
          
          {session && (
            <div className="py-4">
              <Separator className="my-4" />
              <div className="flex items-center gap-2 py-2">
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className={sidebarOpen ? "flex flex-col" : "hidden"}>
                  <motion.span
                    animate={{
                      display: sidebarOpen ? "inline-block" : "none",
                      opacity: sidebarOpen ? 1 : 0,
                    }}
                    className="text-sm font-medium leading-none"
                  >
                    {session.user.email?.split('@')[0]}
                  </motion.span>
                  <motion.span
                    animate={{
                      display: sidebarOpen ? "inline-block" : "none",
                      opacity: sidebarOpen ? 1 : 0,
                    }}
                    className="text-xs text-muted-foreground"
                  >
                    {session.user.email}
                  </motion.span>
                </div>
              </div>
              
              <SidebarLink
                link={{
                  href: "#",
                  icon: <LogOut className="w-5 h-5" />,
                  label: "Sign Out"
                }}
                onClick={handleSignOut}
              />
            </div>
          )}
        </SidebarBody>
      </Sidebar>
      
      <main className="flex-1 overflow-auto bg-[#f8f9fc]">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
