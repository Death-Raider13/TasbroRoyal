import { useState, useId } from 'react';
import { sanitizeInput } from '../../utils/validation';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const SecureInput = ({ 
  type = 'text', 
  label,
  value, 
  onChange, 
  validate,
  sanitize = true,
  required = false,
  placeholder,
  helpText,
  className = '',
  ...props 
}) => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  
  const handleChange = (e) => {
    let inputValue = e.target.value;
    
    // Sanitize input if enabled
    if (sanitize && typeof inputValue === 'string') {
      inputValue = sanitizeInput(inputValue);
    }
    
    // Validate input if validator provided
    if (validate && touched) {
      const validation = validate(inputValue);
      setError(validation.isValid ? '' : validation.error);
    }
    
    // Call parent onChange with sanitized value
    onChange({ ...e, target: { ...e.target, value: inputValue } });
  };
  
  const handleBlur = (e) => {
    setTouched(true);
    
    // Validate on blur
    if (validate) {
      const validation = validate(e.target.value);
      setError(validation.isValid ? '' : validation.error);
    }
    
    // Call parent onBlur if provided
    if (props.onBlur) {
      props.onBlur(e);
    }
  };
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasError = error && touched;
  
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label 
          htmlFor={fieldId} 
          className={`form-label ${required ? 'required' : ''}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={fieldId}
          type={inputType}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`form-input ${hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${
            type === 'password' ? 'pr-12' : ''
          }`}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={`${hasError ? errorId : ''} ${helpText ? helpId : ''}`.trim()}
          {...props}
        />
        
        {/* Password visibility toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}
        
        {/* Error icon */}
        {hasError && type !== 'password' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>
      
      {/* Help text */}
      {helpText && !hasError && (
        <div id={helpId} className="text-sm text-gray-500 mt-1">
          {helpText}
        </div>
      )}
      
      {/* Error message */}
      {hasError && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

// Password strength indicator component
export const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    const strengthLevels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-red-400' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' }
    ];
    
    return {
      score,
      ...strengthLevels[score] || strengthLevels[0]
    };
  };
  
  const strength = getStrength(password);
  
  if (!password) return null;
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">Password strength:</span>
        <span className={`font-medium ${
          strength.score >= 4 ? 'text-green-600' : 
          strength.score >= 3 ? 'text-blue-600' :
          strength.score >= 2 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {strength.label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Password should contain uppercase, lowercase, numbers, and special characters
      </div>
    </div>
  );
};

// Secure textarea component
export const SecureTextarea = ({ 
  label,
  value, 
  onChange, 
  validate,
  sanitize = true,
  required = false,
  placeholder,
  helpText,
  rows = 4,
  maxLength,
  className = '',
  ...props 
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  
  const handleChange = (e) => {
    let inputValue = e.target.value;
    
    // Enforce max length
    if (maxLength && inputValue.length > maxLength) {
      inputValue = inputValue.slice(0, maxLength);
    }
    
    // Sanitize input if enabled
    if (sanitize && typeof inputValue === 'string') {
      inputValue = sanitizeInput(inputValue);
    }
    
    // Validate input if validator provided
    if (validate && touched) {
      const validation = validate(inputValue);
      setError(validation.isValid ? '' : validation.error);
    }
    
    onChange({ ...e, target: { ...e.target, value: inputValue } });
  };
  
  const handleBlur = (e) => {
    setTouched(true);
    
    if (validate) {
      const validation = validate(e.target.value);
      setError(validation.isValid ? '' : validation.error);
    }
    
    if (props.onBlur) {
      props.onBlur(e);
    }
  };
  
  const hasError = error && touched;
  const currentLength = value ? value.length : 0;
  
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label 
          htmlFor={fieldId} 
          className={`form-label ${required ? 'required' : ''}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          id={fieldId}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`form-input resize-none ${hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={`${hasError ? errorId : ''} ${helpText ? helpId : ''}`.trim()}
          {...props}
        />
        
        {/* Character count */}
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
      
      {/* Help text */}
      {helpText && !hasError && (
        <div id={helpId} className="text-sm text-gray-500 mt-1">
          {helpText}
        </div>
      )}
      
      {/* Error message */}
      {hasError && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default SecureInput;
