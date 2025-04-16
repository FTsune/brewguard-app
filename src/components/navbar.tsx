"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Leaf, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/logger"

interface NavbarProps {
  toggleSidebar: () => void
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const handleToggleMobileMenu = () => {
    logger.info(`Mobile menu ${isMobileMenuOpen ? "closed" : "opened"}`, { context: "navigation" })
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleToggleSidebar = () => {
    logger.info("Sidebar toggled from navbar", { context: "navigation" })
    toggleSidebar()
  }

  return (
    <header className="border-b bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm sticky top-0 z-30">
      <div className="container flex h-16 items-center px-4">
        {/* Mobile menu button */}
        {isMobile && (
          <Button variant="ghost" size="icon" className="mr-2" onClick={handleToggleSidebar}>
            <Menu className="h-5 w-5 dark:text-gray-300" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}

        <div className="flex items-center gap-2 font-semibold dark:text-white">
          <div className="flex items-center justify-center bg-teal dark:bg-[#00fecb] rounded-full p-1.5">
            <Leaf className="h-5 w-5 text-white dark:text-gray-900" />
          </div>
          <span className="text-lg">BrewGuard</span>
        </div>

        {/* Desktop navigation */}
        <nav className="ml-auto hidden md:flex gap-6">
          <Link
            href="/"
            className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:bg-teal dark:after:bg-[#00fecb] after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300 dark:text-white"
          >
            Home
          </Link>
          <Link
            href="/dataset"
            className="text-sm font-medium text-muted-foreground dark:text-gray-400 transition-colors hover:text-teal dark:hover:text-[#00fecb]"
          >
            Dataset
          </Link>
          <Link
            href="/map"
            className="text-sm font-medium text-muted-foreground dark:text-gray-400 transition-colors hover:text-teal dark:hover:text-[#00fecb]"
          >
            Map
          </Link>
          <Link
            href="/team"
            className="text-sm font-medium text-muted-foreground dark:text-gray-400 transition-colors hover:text-teal dark:hover:text-[#00fecb]"
          >
            Team
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        {isMobile && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={handleToggleMobileMenu}>
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 dark:text-gray-300" />
            ) : (
              <Menu className="h-5 w-5 dark:text-gray-300" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-md z-20">
          <nav className="flex flex-col p-4">
            <Link
              href="/"
              className="py-2 px-4 text-sm font-medium hover:bg-teal/10 dark:hover:bg-[#00fecb]/10 rounded-md dark:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/dataset"
              className="py-2 px-4 text-sm font-medium hover:bg-teal/10 dark:hover:bg-[#00fecb]/10 rounded-md dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dataset
            </Link>
            <Link
              href="/map"
              className="py-2 px-4 text-sm font-medium hover:bg-teal/10 dark:hover:bg-[#00fecb]/10 rounded-md dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Map
            </Link>
            <Link
              href="/team"
              className="py-2 px-4 text-sm font-medium hover:bg-teal/10 dark:hover:bg-[#00fecb]/10 rounded-md dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Team
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}