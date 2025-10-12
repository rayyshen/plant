'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface AutocompleteOption {
    value: string;
    label: string;
    description?: string;
}

interface AutocompleteDropdownProps {
    options: AutocompleteOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
}

export function AutocompleteDropdown({
    options,
    value,
    onChange,
    placeholder = '',
    label,
    required = false,
    className = '',
    disabled = false
}: AutocompleteDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>(options);
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter options based on input value
    useEffect(() => {
        if (inputValue.trim() === '') {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(option =>
                option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                (option.description && option.description.toLowerCase().includes(inputValue.toLowerCase()))
            );
            setFilteredOptions(filtered);
        }
    }, [inputValue, options]);

    // Update input value when external value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setIsOpen(true);
    };

    // Handle option selection
    const handleOptionSelect = (option: AutocompleteOption) => {
        setInputValue(option.label);
        onChange(option.value);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    // Handle input focus
    const handleInputFocus = () => {
        setIsOpen(true);
    };

    // Handle input blur
    const handleInputBlur = () => {
        // Delay closing to allow option click
        setTimeout(() => {
            if (!dropdownRef.current?.contains(document.activeElement)) {
                setIsOpen(false);
            }
        }, 150);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        const currentIndex = filteredOptions.findIndex(option => option.value === value);
        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                newIndex = currentIndex < filteredOptions.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowUp':
                e.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : filteredOptions.length - 1;
                break;
            case 'Enter':
                e.preventDefault();
                if (currentIndex >= 0) {
                    handleOptionSelect(filteredOptions[currentIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }

        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < filteredOptions.length) {
            onChange(filteredOptions[newIndex].value);
        }
    };

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative" ref={dropdownRef}>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

                {/* Dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                        className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Dropdown menu */}
                {isOpen && filteredOptions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleOptionSelect(option)}
                                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                                    }`}
                            >
                                <div className="font-medium">{option.label}</div>
                                {option.description && (
                                    <div className="text-sm text-gray-500">{option.description}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* No results message */}
                {isOpen && filteredOptions.length === 0 && inputValue.trim() !== '' && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        <div className="px-3 py-2 text-gray-500 text-sm">
                            No majors found matching &quot;{inputValue}&quot;
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
