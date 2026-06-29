"use client";

import { useState } from "react";
import { LANGUAGE_OPTIONS, WORKING_STYLE_OPTIONS, EXPERIENCE_LEVEL_OPTIONS } from "@/lib/matchFactorLabels";

export default function ProfessionalPreferencesForm({ initialValues = {}, onSave, isLoading = false }) {
  const [languages, setLanguages] = useState(initialValues.languages_spoken || []);
  const [workingStyle, setWorkingStyle] = useState(initialValues.working_style_structured || '');
  const [experienceLevel, setExperienceLevel] = useState(initialValues.experience_level || '');

  const handleLanguageToggle = (value) => {
    setLanguages(prev =>
      prev.includes(value)
        ? prev.filter(l => l !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      languages_spoken: languages,
      working_style_structured: workingStyle,
      experience_level: experienceLevel,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-3 block text-sm font-semibold text-gray-700">
          Languages Spoken
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LANGUAGE_OPTIONS.map(option => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={languages.includes(option.value)}
                onChange={() => handleLanguageToggle(option.value)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="working-style" className="mb-2 block text-sm font-semibold text-gray-700">
          Working Style
        </label>
        <select
          id="working-style"
          value={workingStyle}
          onChange={(e) => setWorkingStyle(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:ring-primary"
        >
          <option value="">Select your working style</option>
          {WORKING_STYLE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="experience-level" className="mb-2 block text-sm font-semibold text-gray-700">
          Experience Level
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {EXPERIENCE_LEVEL_OPTIONS.map(option => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="experience"
                value={option.value}
                checked={experienceLevel === option.value}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
}
