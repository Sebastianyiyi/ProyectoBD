import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableSelect({ options, value, onChange, placeholder = 'Selecciona...', disabled = false }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className={`flex min-h-[42px] w-full items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm shadow-sm transition-all cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-red-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border bg-white shadow-lg animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center border-b px-3 py-2 bg-gray-50/50 rounded-t-xl">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-3 text-sm text-center text-gray-500">No se encontraron resultados</li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-red-50 hover:text-red-900 ${
                    value === option.value ? 'bg-red-50/50 text-red-900 font-medium' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {option.label}
                  {value === option.value && <Check className="h-4 w-4 text-red-600" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
