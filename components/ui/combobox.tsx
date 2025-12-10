"use client";

import { cn } from "@/lib/utils"
import { ChevronsUpDownIcon, CheckIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command"

type ComboboxProps = {
  items: { key: string, value: string }[];
  defaultKey: string;
  onChange: (key: string) => void;
}

export default function Combobox(props: ComboboxProps) {
  const { items, defaultKey, onChange } = props;
  const [open, setOpen] = useState<boolean>(false)
  const [key, setKey] = useState<string>(defaultKey)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex w-[200px] justify-between"
        >
          {key
            ? items.find((item) => item.key === key)?.value
            : <span></span>}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command
          filter={(key, search) => {
            const item = items.find((item) => item.key === key);
            if (item && item.value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput placeholder="Search item..." />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.key}
                  value={item.key}
                  onSelect={(currentKey) => {
                    setKey(currentKey === key ? "" : currentKey)
                    setOpen(false)
                    onChange(currentKey);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      key === item.key ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.value}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
