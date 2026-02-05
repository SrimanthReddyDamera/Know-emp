"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { searchKnowledge } from "@/app/actions/search"
import { Button } from "@/components/ui/button"

export function DashboardSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true)
        const data = await searchKnowledge(query)
        setResults(data)
        setLoading(false)
        setOpen(true)
      } else {
        setResults([])
        setOpen(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/employee/knowledge?q=${encodeURIComponent(query)}`)
      setOpen(false)
    }
  }

  function handleSelect(id: string) {
    router.push(`/employee/knowledge?id=${id}`)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search knowledge base..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-background"
          onFocus={() => {
             if (results.length > 0) setOpen(true)
          }}
        />
        {loading && (
          <div className="absolute right-3 top-3">
             <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </form>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground border rounded-md shadow-md z-50 overflow-hidden">
          <div className="p-1">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelect(result.id)}
                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm text-sm"
              >
                {result.title}
              </div>
            ))}
            <div className="border-t border-border mt-1 pt-1">
              <div 
                onClick={(e) => handleSearch(e as any)}
                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm text-sm text-muted-foreground italic text-center"
              >
                Press Enter to see all results
              </div>
            </div>
          </div>
        </div>
      )}
       {open && results.length === 0 && query.length >= 2 && !loading && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground border rounded-md shadow-md z-50 p-4 text-center text-sm text-muted-foreground">
            No results found.
          </div>
        )}
    </div>
  )
}
