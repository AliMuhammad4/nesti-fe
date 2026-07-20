"use client";

export default function UserTypeSelector({ value, onChange, error }) {
  const userTypes = [
    { value: "professional", label: "Professional" },
    { value: "client", label: "User" }
  ];

  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-text-heading">
        I am a <span className="text-red-500">*</span>
      </label>
      
      <div className="flex gap-2.5">
        {userTypes.map((type) => {
          const isSelected = value === type.value;
          
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={`flex-1 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isSelected
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } ${error && !value ? "ring-2 ring-red-400" : ""}`}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      {error && <p className="ml-1 mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
