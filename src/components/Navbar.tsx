
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LineChart, UploadCloud, Home, UserCircle, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { session, signOut } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const links = [
    {
      href: '/',
      icon: <Home className="w-5 h-5" />,
      label: 'Home'
    },
    {
      href: '/input',
      icon: <UploadCloud className="w-5 h-5" />,
      label: 'Upload Data'
    },
    {
      href: '/plot',
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Visualize Data'
    }
  ];

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 ease-in-out py-3 px-4 md:px-6",
      scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <LineChart className="w-6 h-6 text-primary" />
          <span className="font-semibold text-lg">Graphify</span>
        </Link>
        
        <nav className="hidden md:flex space-x-1">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline-block mr-2">
                {session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gap-2">
                <UserCircle className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
