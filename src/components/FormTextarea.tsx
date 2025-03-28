
import React, { useState, ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  rows?: number;
}

const FormTextarea = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className,
  rows = 3,
}: FormTextareaProps) => {
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
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={cn(
          "transition-all duration-200",
          focused ? "border-delta-500 ring-1 ring-delta-300" : "",
          error ? "border-destructive" : ""
        )}
        rows={rows}
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export default FormTextarea;
