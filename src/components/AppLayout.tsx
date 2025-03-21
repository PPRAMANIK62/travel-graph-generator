
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, UploadCloud, LogOut, BarChart3, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      icon: <Home className="w-4 h-4 mr-2" />,
      label: 'Home'
    },
    {
      href: '/input',
      icon: <UploadCloud className="w-4 h-4 mr-2" />,
      label: 'Data Management'
    },
    {
      href: '/plot',
      icon: <BarChart3 className="w-4 h-4 mr-2" />,
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
      <header className="fixed top-0 left-0 right-0 z-10 flex h-14 items-center justify-between border-b border-border/30 bg-white px-4 shadow-sm">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-md flex-shrink-0 mr-2">
            <div className="text-primary h-5 w-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-line-chart"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
          </div>
          <span className="font-semibold text-lg text-black">Graphify</span>
        </div>

        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Button
                key={link.href}
                variant={location.pathname === link.href ? "default" : "ghost"}
                className={location.pathname === link.href ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
                onClick={() => navigate(link.href)}
              >
                <span className="flex items-center">
                  {link.icon}
                  {link.label}
                </span>
              </Button>
            ))}
          </nav>

          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                  <Avatar className="h-8 w-8 border border-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium">{session.user.email?.split('@')[0]}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive/80 focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {links.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  className={location.pathname === link.href ? "bg-primary/10 text-primary" : ""}
                  onClick={() => navigate(link.href)}
                >
                  <span className="flex items-center">
                    {link.icon}
                    {link.label}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto bg-[#f8f9fc] pt-14">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
