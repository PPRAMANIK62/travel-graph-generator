
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { open, setOpen, animate } = useSidebar();
  
  // Only include safe props for motion.div
  const motionProps: HTMLMotionProps<"div"> = {
    className: cn(
      "h-full px-6 py-6 hidden md:flex md:flex-col bg-white dark:bg-neutral-900 border-r border-border/30 shadow-sm w-[280px] flex-shrink-0",
      className
    ),
    animate: {
      width: animate ? (open ? "280px" : "80px") : "280px",
    },
    transition: { duration: 0.2, ease: "easeInOut" },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
  };

  return (
    <motion.div
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-14 px-4 py-2 flex flex-row md:hidden items-center justify-between bg-white dark:bg-neutral-900 border-b border-border/30 w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-foreground hover:text-primary cursor-pointer transition-colors"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-background/95 backdrop-blur-sm p-6 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-6 top-6 z-50 p-2 rounded-full hover:bg-muted cursor-pointer transition-colors"
                onClick={() => setOpen(!open)}
              >
                <X className="text-foreground" />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

interface SidebarLinkProps {
  link: Links;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  [key: string]: any;
}

export const SidebarLink = ({
  link,
  className,
  active = false,
  onClick,
  ...props
}: SidebarLinkProps) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar rounded-md px-3 py-2.5 transition-all duration-200 hover:bg-accent/50",
        active ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:text-foreground",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className={cn(
        "flex-shrink-0 transition-transform duration-200",
        active ? "text-primary" : "text-foreground/70 group-hover/sidebar:text-foreground"
      )}>
        {link.icon}
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-sm transition-all duration-200 whitespace-pre",
          active ? "text-primary font-medium" : "text-foreground/80 group-hover/sidebar:text-foreground"
        )}
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

export const Logo = ({ iconOnly = false }) => {
  return (
    <div
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-md flex-shrink-0">
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
      {!iconOnly && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-semibold text-lg text-black dark:text-white whitespace-pre"
        >
          Graphify
        </motion.span>
      )}
    </div>
  );
};

export const LogoIcon = () => {
  return <Logo iconOnly={true} />;
};
