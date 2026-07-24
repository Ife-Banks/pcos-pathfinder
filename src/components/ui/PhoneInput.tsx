import { useState, useEffect } from 'react';
import { parsePhoneNumberFromString, getExampleNumber } from 'libphonenumber-js';
import { ChevronDown } from 'lucide-react';

interface Country {
  name: string;
  code: string;
  iso: string;
  maxDigits?: number;
}

const countries: Country[] = [
  { name: 'Nigeria', code: '+234', iso: 'NG', maxDigits: 10 },
  { name: 'Ghana', code: '+233', iso: 'GH' },
  { name: 'Kenya', code: '+254', iso: 'KE' },
  { name: 'South Africa', code: '+27', iso: 'ZA' },
  { name: 'United Kingdom', code: '+44', iso: 'GB' },
  { name: 'United States', code: '+1', iso: 'US', maxDigits: 10 },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const PhoneInput = ({
  value,
  onChange,
  placeholder = '801 234 5678',
  error,
  disabled = false,
  className = ''
}: PhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [localNumber, setLocalNumber] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (value && value.startsWith('+')) {
      const parsed = parsePhoneNumberFromString(value);
      if (parsed) {
        const countryCode = '+' + parsed.countryCallingCode;
        const country = countries.find(c => c.code === countryCode);
        if (country) {
          setSelectedCountry(country);
          setLocalNumber(parsed.nationalNumber);
        } else {
          const country = countries.find(c => c.code.startsWith('+'));
          if (country) {
            setSelectedCountry(country);
            setLocalNumber(value.replace(country.code, ''));
          }
        }
      } else {
        for (const country of countries) {
          if (value.startsWith(country.code)) {
            setSelectedCountry(country);
            setLocalNumber(value.replace(country.code, ''));
            break;
          }
        }
      }
    } else if (value && !value.startsWith('+')) {
      setLocalNumber(value);
    }
  }, []);

  const formatDisplay = (digits: string, countryCode: string): string => {
    if (countryCode === '+234') {
      const d = digits.replace(/\D/g, '').slice(0, 10);
      if (d.length <= 3) return d;
      if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
      return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
    }
    return digits;
  };

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    const maxDigits = selectedCountry.maxDigits;
    const truncated = maxDigits ? raw.slice(0, maxDigits) : raw;
    setLocalNumber(truncated);

    if (truncated.length > 0) {
      const fullNumber = selectedCountry.code + truncated;
      const parsed = parsePhoneNumberFromString(fullNumber);
      if (parsed && parsed.isValid()) {
        onChange(parsed.format('E.164'));
      } else if (truncated.length >= 7) {
        onChange(selectedCountry.code + truncated);
      }
    } else {
      onChange('');
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    if (localNumber) {
      const fullNumber = country.code + localNumber;
      const parsed = parsePhoneNumberFromString(fullNumber);
      if (parsed && parsed.isValid()) {
        onChange(parsed.format('E.164'));
      } else {
        onChange(country.code + localNumber);
      }
    }
  };

  const getExample = () => {
    try {
      const example = getExampleNumber(selectedCountry.iso, undefined);
      if (example) {
        return example.formatNational();
      }
    } catch {
      return placeholder;
    }
    return placeholder;
  };

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="relative w-44">
          <button
            type="button"
            onClick={() => !disabled && setShowDropdown(!showDropdown)}
            className={`flex items-center justify-between w-full px-3 py-2.5 border rounded-lg bg-white text-left text-sm transition-colors ${
              disabled 
                ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                : 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
            } ${error ? 'border-red-500' : 'border-gray-300'}`}
            disabled={disabled}
          >
            <span className="font-medium">
              {selectedCountry.name} <span className="text-gray-500">{selectedCountry.code}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          
          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              {countries.map((country) => (
                <button
                  key={country.iso}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    selectedCountry.iso === country.iso ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {country.name} <span className="text-gray-500">{country.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="tel"
          value={formatDisplay(localNumber, selectedCountry.code)}
          onChange={handleLocalNumberChange}
          placeholder={getExample()}
          disabled={disabled}
          maxLength={selectedCountry.maxDigits ? selectedCountry.maxDigits + 2 : 20}
          className={`flex-1 px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white'
          } ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
      </div>
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;