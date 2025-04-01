
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const FormSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = "Selecione uma opção",
  className,
}: FormSelectProps) => {
  const [focused, setFocused] = useState(false);

  // Filter out any options with empty string values
  const validOptions = options.filter(option => option.value !== "");

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
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          id={id}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "transition-all duration-200",
            focused ? "border-delta-500 ring-1 ring-delta-300" : "",
            error ? "border-destructive" : ""
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {validOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export default FormSelect;
