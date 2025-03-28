
import React, { useState, ChangeEvent } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormComboboxProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCustomInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  placeholder?: string;
  customPlaceholder?: string;
  className?: string;
}

const FormCombobox = ({
  id,
  label,
  value,
  onChange,
  onCustomInputChange,
  options,
  error,
  required = false,
  placeholder = "Selecione uma opção",
  customPlaceholder = "Digite uma opção personalizada",
  className,
}: FormComboboxProps) => {
  const [focused, setFocused] = useState(false);
  const [useCustom, setUseCustom] = useState(false);

  const handleSelectChange = (newValue: string) => {
    if (newValue === "custom") {
      setUseCustom(true);
      onChange("");
    } else {
      setUseCustom(false);
      onChange(newValue);
    }
  };

  const handleCustomInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onCustomInputChange(e);
  };

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
      
      {!useCustom ? (
        <Select value={value || ""} onValueChange={handleSelectChange}>
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
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={handleCustomInputChange}
            placeholder={customPlaceholder}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              "transition-all duration-200 flex-1",
              focused ? "border-delta-500 ring-1 ring-delta-300" : "",
              error ? "border-destructive" : ""
            )}
          />
          <button
            type="button"
            onClick={() => setUseCustom(false)}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            ↩
          </button>
        </div>
      )}
      
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export default FormCombobox;
