import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const SidebarContext = createContext(null);
// Desktop and laptop share the icon rail; only phones use an overlay drawer.
const DESKTOP_QUERY = "(min-width: 768px)";

export function SidebarProvider({ children }) {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const handleChange = event => {
      setIsDesktop(event.matches);
      setIsSidebarExpanded(false);
      setIsMobileSidebarOpen(false);
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarExpanded(false);
    setIsMobileSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isDesktop) setIsSidebarExpanded(current => !current);
    else setIsMobileSidebarOpen(current => !current);
  }, [isDesktop]);

  return <SidebarContext.Provider value={{
    isDesktop, isSidebarExpanded, isMobileSidebarOpen,
    isNavigationOpen: isDesktop ? isSidebarExpanded : isMobileSidebarOpen,
    closeSidebar, toggleSidebar,
  }}>{children}</SidebarContext.Provider>;
}

export const useSidebar = () => useContext(SidebarContext);
