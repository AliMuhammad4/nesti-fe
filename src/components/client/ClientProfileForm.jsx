"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Home, Calendar, TrendingUp, ArrowRight, Loader2, Briefcase, MapPin } from "lucide-react";

const TIMELINE_OPTIONS = [
  { value: '1_year', label: 'Within 1 year' },
  { value: '2_years', label: '1-2 years' },
  { value: '3_years', label: '2-3 years' },
  { value: '5_years', label: '3-5 years' },
  { value: 'exploring', label: 'Just exploring' },
];

const EMPLOYMENT_OPTIONS = [
  { value: 'full_time', label: 'Full-time employed' },
  { value: 'part_time', label: 'Part-time employed' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'contract', label: 'Contract / freelance' },
  { value: 'unemployed', label: 'Currently unemployed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'other', label: 'Other' },
];

export default function ClientProfileForm({ initialData = {}, onSave, isLoading = false }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    annual_income: initialData.annual_income || '',
    employment_status: initialData.employment_status || '',
    current_savings: initialData.current_savings || '',
    monthly_savings: initialData.monthly_savings || '',
    dream_home_price: initialData.dream_home_price || '',
    preferred_location: initialData.preferred_location || '',
    purchase_timeline: initialData.purchase_timeline || '',
  });

  const [errors, setErrors] = useState({});

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.annual_income || formData.annual_income <= 0) {
        newErrors.annual_income = 'Please enter your annual income';
      }
      if (!formData.employment_status) {
        newErrors.employment_status = 'Please select your employment status';
      }
    }

    if (currentStep === 2) {
      if (!formData.current_savings || formData.current_savings < 0) {
        newErrors.current_savings = 'Please enter your current savings';
      }
      if (!formData.monthly_savings || formData.monthly_savings < 0) {
        newErrors.monthly_savings = 'Please enter your monthly savings';
      }
      if (!formData.dream_home_price || formData.dream_home_price <= 0) {
        newErrors.dream_home_price = 'Please enter your dream home price';
      }
      if (!formData.preferred_location.trim()) {
        newErrors.preferred_location = 'Please enter your preferred location';
      }
    }

    if (currentStep === 3) {
      if (!formData.purchase_timeline) {
        newErrors.purchase_timeline = 'Please select your purchase timeline';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      onSave({
        annual_income: parseFloat(formData.annual_income),
        employment_status: formData.employment_status,
        current_savings: parseFloat(formData.current_savings),
        monthly_savings: parseFloat(formData.monthly_savings),
        dream_home_price: parseFloat(formData.dream_home_price),
        preferred_location: formData.preferred_location.trim(),
        purchase_timeline: formData.purchase_timeline,
      });
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  s <= step
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded ${
                    s < step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span className={step === 1 ? 'font-semibold text-primary' : ''}>Income</span>
          <span className={step === 2 ? 'font-semibold text-primary' : ''}>Goals</span>
          <span className={step === 3 ? 'font-semibold text-primary' : ''}>Timeline</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Income Information</h2>
                  <p className="text-sm text-gray-600">Help us understand your financial situation</p>
                </div>
              </div>

              <div>
                <label htmlFor="annual_income" className="mb-2 block text-sm font-semibold text-gray-700">
                  Annual Income
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="annual_income"
                    type="number"
                    value={formData.annual_income}
                    onChange={(e) => handleChange('annual_income', e.target.value)}
                    placeholder="75,000"
                    className={`w-full rounded-lg border ${
                      errors.annual_income ? 'border-red-300' : 'border-gray-300'
                    } py-3 pl-8 pr-4 text-lg focus:border-primary focus:ring-primary`}
                  />
                </div>
                {errors.annual_income && (
                  <p className="mt-1 text-sm text-red-600">{errors.annual_income}</p>
                )}
                {formData.annual_income && !errors.annual_income && (
                  <p className="mt-2 text-sm text-gray-600">
                    {formatCurrency(formData.annual_income)} per year
                  </p>
                )}
              </div>

              <div className="mt-6">
                <label htmlFor="employment_status" className="mb-2 block text-sm font-semibold text-gray-700">
                  Employment Status
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    id="employment_status"
                    value={formData.employment_status}
                    onChange={(e) => handleChange('employment_status', e.target.value)}
                    className={`w-full appearance-none rounded-lg border ${
                      errors.employment_status ? 'border-red-300' : 'border-gray-300'
                    } bg-white py-3 pl-11 pr-4 text-base text-gray-900 focus:border-primary focus:ring-primary`}
                  >
                    <option value="">Select employment status</option>
                    {EMPLOYMENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.employment_status && (
                  <p className="mt-1 text-sm text-red-600">{errors.employment_status}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Savings & Goals</h2>
                  <p className="text-sm text-gray-600">Tell us about your homeownership goals</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="current_savings" className="mb-2 block text-sm font-semibold text-gray-700">
                    Current Savings
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      id="current_savings"
                      type="number"
                      value={formData.current_savings}
                      onChange={(e) => handleChange('current_savings', e.target.value)}
                      placeholder="50,000"
                      className={`w-full rounded-lg border ${
                        errors.current_savings ? 'border-red-300' : 'border-gray-300'
                      } py-3 pl-8 pr-4 text-lg focus:border-primary focus:ring-primary`}
                    />
                  </div>
                  {errors.current_savings && (
                    <p className="mt-1 text-sm text-red-600">{errors.current_savings}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="monthly_savings" className="mb-2 block text-sm font-semibold text-gray-700">
                    Monthly Savings
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      id="monthly_savings"
                      type="number"
                      value={formData.monthly_savings}
                      onChange={(e) => handleChange('monthly_savings', e.target.value)}
                      placeholder="1,000"
                      className={`w-full rounded-lg border ${
                        errors.monthly_savings ? 'border-red-300' : 'border-gray-300'
                      } py-3 pl-8 pr-4 text-lg focus:border-primary focus:ring-primary`}
                    />
                  </div>
                  {errors.monthly_savings && (
                    <p className="mt-1 text-sm text-red-600">{errors.monthly_savings}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dream_home_price" className="mb-2 block text-sm font-semibold text-gray-700">
                    Dream Home Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      id="dream_home_price"
                      type="number"
                      value={formData.dream_home_price}
                      onChange={(e) => handleChange('dream_home_price', e.target.value)}
                      placeholder="500,000"
                      className={`w-full rounded-lg border ${
                        errors.dream_home_price ? 'border-red-300' : 'border-gray-300'
                      } py-3 pl-8 pr-4 text-lg focus:border-primary focus:ring-primary`}
                    />
                  </div>
                  {errors.dream_home_price && (
                    <p className="mt-1 text-sm text-red-600">{errors.dream_home_price}</p>
                  )}
                  {formData.dream_home_price && !errors.dream_home_price && (
                    <p className="mt-2 text-sm text-primary font-semibold">
                      20% down payment: {formatCurrency(formData.dream_home_price * 0.2)}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="preferred_location" className="mb-2 block text-sm font-semibold text-gray-700">
                    Preferred Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="preferred_location"
                      type="text"
                      value={formData.preferred_location}
                      onChange={(e) => handleChange('preferred_location', e.target.value)}
                      placeholder="Toronto, Mississauga, Downtown..."
                      className={`w-full rounded-lg border ${
                        errors.preferred_location ? 'border-red-300' : 'border-gray-300'
                      } py-3 pl-11 pr-4 text-base focus:border-primary focus:ring-primary`}
                    />
                  </div>
                  {errors.preferred_location && (
                    <p className="mt-1 text-sm text-red-600">{errors.preferred_location}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Purchase Timeline</h2>
                  <p className="text-sm text-gray-600">When are you planning to buy?</p>
                </div>
              </div>

              <div className="space-y-3">
                {TIMELINE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                      formData.purchase_timeline === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeline"
                      value={option.value}
                      checked={formData.purchase_timeline === option.value}
                      onChange={(e) => handleChange('purchase_timeline', e.target.value)}
                      className="h-5 w-5 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                  </label>
                ))}
                {errors.purchase_timeline && (
                  <p className="text-sm text-red-600">{errors.purchase_timeline}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-4">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={isLoading}
          className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : step === 3 ? (
            <>
              Complete
              <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
