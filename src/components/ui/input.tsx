import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 
            border-2 border-gray-300 dark:border-gray-600
            rounded-lg 
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-500 
            focus:border-blue-500
            hover:border-gray-400 dark:hover:border-gray-500
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-3 
            border-2 border-gray-300 dark:border-gray-600
            rounded-lg 
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-500 
            focus:border-blue-500
            hover:border-gray-400 dark:hover:border-gray-500
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 
            border-2 border-gray-300 dark:border-gray-600
            rounded-lg 
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-500 
            focus:border-blue-500
            hover:border-gray-400 dark:hover:border-gray-500
            transition-all duration-200
            resize-none
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";