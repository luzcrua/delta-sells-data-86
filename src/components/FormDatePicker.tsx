
import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FormDatePickerProps {
  id: string;
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  error?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

const FormDatePicker = ({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  className,
  placeholder = "Selecione uma data",
}: FormDatePickerProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={id} 
        className={cn(
          "transition-all duration-200",
          focused ? "text-delta-500" : "",
          required ? "after:content-['*'] after:ml-1 after:text-destructive" : ""
        )}
      >
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              focused ? "border-delta-500 ring-1 ring-delta-300" : "",
              error ? "border-destructive" : ""
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "dd/MM/yy") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export default FormDatePicker;
