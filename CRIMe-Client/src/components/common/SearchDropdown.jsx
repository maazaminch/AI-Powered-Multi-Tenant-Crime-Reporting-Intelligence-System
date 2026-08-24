import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "../ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/Popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/Command";

import { cn } from "../../lib/utils";

const SearchDropdown = ({
  value,
  onChange,
  options = [],

  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",

  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn("w-full h-10 justify-between bg-white px-3 font-normal", className)}
        >
          {selectedOption?.label || placeholder}

          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="z-[9999] w-[var(--radix-popover-trigger-width)] rounded-md border bg-white p-0 shadow-2xl">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />

          <CommandList className="max-h-64">
            <CommandEmpty>
              {emptyMessage}
            </CommandEmpty>

            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="text-slate-900"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />

                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchDropdown;