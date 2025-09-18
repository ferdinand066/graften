import React, { useRef, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InputNumberProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number | null;
  onChange?: (value: number | undefined) => void;
  allowDecimals?: boolean;
  maxDecimals?: number;
  min?: number;
  max?: number;
}

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  ({ value, onChange, allowDecimals = true, maxDecimals = 2, min, max, className, placeholder = "0.00", ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [displayValue, setDisplayValue] = React.useState<string>("");

    // Update display value when prop value changes
    React.useEffect(() => {
      if (value === null || value === undefined) {
        setDisplayValue("");
      } else {
        const formatted = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: allowDecimals ? maxDecimals : 0,
        }).format(value);
        setDisplayValue(formatted);
      }
    }, [value, allowDecimals, maxDecimals]);

    // Parse the input back to number
    const parseNumber = (inputValue: string): number | undefined => {
      const raw = inputValue.replace(/,/g, "");
      if (raw === "") return undefined;

      const parsed = allowDecimals ? parseFloat(raw) : parseInt(raw, 10);
      return isNaN(parsed) ? undefined : parsed;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const inputValue = input.value;
      const cursorPos = input.selectionStart ?? 0;

      // Remove commas for validation
      const raw = inputValue.replace(/,/g, "");

      // Validate input based on decimal settings
      const regex = allowDecimals
        ? new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`)
        : /^\d*$/;

      if (raw === "" || regex.test(raw)) {
        const numericValue = parseNumber(inputValue);

        // Check min/max constraints
        let finalNumericValue = numericValue;

        if (min !== undefined) {
          finalNumericValue = finalNumericValue || 0;
        }

        console.log({numericValue})
        if (numericValue !== undefined) {
          if (min !== undefined && numericValue < min) {
            finalNumericValue = min;
          } else if (max !== undefined && numericValue > max) {
            finalNumericValue = max;
          }
        }

        // Format the input with commas while preserving trailing decimal point
        let formattedInput = inputValue;
        if (raw !== "" && !isNaN(parseFloat(raw))) {
          const parts = raw.split('.');
          const intPart = parts[0];
          const decimalPart = parts[1];

          // Format the integer part with commas
          const formattedInt = new Intl.NumberFormat("en-US").format(parseInt(intPart || "0", 10));

          if (decimalPart !== undefined) {
            // Preserve decimal part exactly as typed
            formattedInput = `${formattedInt}.${decimalPart}`;
          } else if (inputValue.includes('.')) {
            // Preserve trailing decimal point
            formattedInput = `${formattedInt}.`;
          } else {
            formattedInput = formattedInt;
          }
        }

        // If value was constrained, update the formatted input to reflect the constraint
        if (finalNumericValue !== numericValue) {
          if (finalNumericValue !== undefined) {
            formattedInput = new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: allowDecimals ? maxDecimals : 0,
            }).format(finalNumericValue);
          }
        }

        // Calculate cursor position adjustment
        const prevBefore = displayValue.slice(0, Math.min(cursorPos, displayValue.length));
        const newBefore = formattedInput.slice(0, Math.min(cursorPos, formattedInput.length));

        const prevCommas = (prevBefore.match(/,/g) || []).length;
        const newCommas = (newBefore.match(/,/g) || []).length;
        const diff = newCommas - prevCommas;

        setDisplayValue(formattedInput);
        onChange?.(finalNumericValue);

        // Adjust cursor position after formatting
        requestAnimationFrame(() => {
          const currentInput = inputRef.current || input;
          if (currentInput) {
            const newCursorPos = Math.min(cursorPos + diff, formattedInput.length);
            currentInput.setSelectionRange(newCursorPos, newCursorPos);
          }
        });
      }
    };

    return (
      <Input
        {...props}
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
      />
    );
  }
);

InputNumber.displayName = "InputNumber";

export default InputNumber;
