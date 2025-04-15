import Link from "next/link"
import { Leaf } from "lucide-react"

export function Navbar() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex items-center justify-center bg-teal rounded-full p-1.5">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg">BrewGuard</span>
        </div>
        <nav className="ml-auto flex gap-6">
          <Link
            href="/"
            className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:bg-teal after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300"
          >
            Home
          </Link>
          <Link href="/dataset" className="text-sm font-medium text-muted-foreground transition-colors hover:text-teal">
            Dataset
          </Link>
          <Link href="/map" className="text-sm font-medium text-muted-foreground transition-colors hover:text-teal">
            Map
          </Link>
          <Link href="/team" className="text-sm font-medium text-muted-foreground transition-colors hover:text-teal">
            Team
          </Link>
        </nav>
      </div>
    </header>
  )
}