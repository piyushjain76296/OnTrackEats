import React from 'react';

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

const InputField: React.FC<InputFieldProps> = ({ label, placeholder, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default InputField;
