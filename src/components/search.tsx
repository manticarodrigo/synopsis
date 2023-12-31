"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { useDebounce } from "use-debounce"

import { trpc } from "@/lib/trpc"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { Skeleton } from "./ui/skeleton"

type Props = {
  initialQuery?: string
  onSubmit?: (query: string) => void
}

export function SearchForm(props: Props) {
  const router = useRouter()

  const [search, setSearch] = useState(props.initialQuery ?? "")
  const [term] = useDebounce(search, 500)

  const suggestions = trpc.suggestions.useQuery(term, {
    keepPreviousData: true,
  })

  const options = Array.from(
    new Set([search.trim(), ...(suggestions.data ?? [])].filter(Boolean))
  )

  const isPending = term !== search || suggestions.isLoading

  const onSelect = (value: string) => {
    props.onSubmit?.(value)
    router.push(`/search/${value}`)
  }

  return (
    <Command shouldFilter={false}>
      <CommandInput
        value={search}
        placeholder="Type something to get started..."
        onValueChange={setSearch}
      />
      <CommandList className="h-[265px]">
        <CommandEmpty className="items-start p-0">
          {isPending ? (
            <div className="flex flex-col gap-2 p-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <div className="flex h-[250px] flex-col items-center justify-center gap-4">
              <AlertTriangle />
              <span className="text-lg font-medium">No results found.</span>
            </div>
          )}
        </CommandEmpty>
        <CommandGroup>
          {options.map((option, idx) => (
            <CommandItem key={`${option}-${idx}`} onSelect={onSelect}>
              {option}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
