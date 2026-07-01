"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";
import { roles } from "@/constants/auth";
import { CheckCircle2 } from "lucide-react";

export default function RoleDropdown({
  value,
  onChange,
  onFocus,
  onBlur,
  focusedField,
  error,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedRole = roles.find((r) => r.value === value);

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-text-heading">
        I am a{" "}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`flex h-11 w-full cursor-pointer items-center rounded-xl border bg-white/80 px-3 pr-10 text-left text-sm transition-all duration-200 hover:bg-white hover:shadow-sm focus:ring-2 ${error
            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
            : "border-border hover:border-primary/45 focus:border-primary focus:ring-primary/15"
            } ${value ? "text-text-heading" : "text-text-muted"}`}
        >
          {value ? (
            <div className="flex items-center gap-2">
              {selectedRole?.icon && (
                <div className="flex h-5 w-5 items-center justify-center">
                  {React.createElement(selectedRole.icon, { size: 16, className: "text-primary" })}
                </div>
              )}
              <span className="font-medium">
                {selectedRole?.label || "Choose your role"}
              </span>
            </div>
          ) : (
            <span>Select your role</span>
          )}
        </button>
        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
          <svg
            className={`h-4 w-4 text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-white shadow-xl">
            {roles.map((role, index) => {
              const IconComponent = role.icon;
              const isSelected = value === role.value;
              const isClient = role.value === 'client';
              
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    onChange(role.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 px-3 py-3 text-left transition-colors duration-150 ${isSelected ? "bg-primary/5" : "hover:bg-gray-50"
                    } ${index !== roles.length - 1
                      ? "border-b border-border/50"
                      : ""
                    } ${isClient ? "bg-green-50/50 hover:bg-green-50" : ""}`}
                >
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${isClient ? "bg-green-100" : "bg-primary/10"}`}>
                    <IconComponent size={18} className={isClient ? "text-green-600" : "text-primary"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-heading">
                      {role.label}
                    </div>
                    {role.description && (
                      <div className="text-xs text-text-muted mt-0.5">
                        {role.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="ml-1 mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
