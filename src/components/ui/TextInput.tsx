import { forwardRef, InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-lg font-bold text-navy mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full h-12 px-4
            text-xl font-bold text-navy
            bg-white border-2 border-sky rounded-[28px]
            placeholder:text-sky/50
            focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/30
            transition-colors
            ${error ? "border-rose" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-rose text-sm font-bold mt-2">{error}</p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
