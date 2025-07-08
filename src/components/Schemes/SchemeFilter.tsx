import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { COUNTRIES, SCHEME_CATEGORIES } from '../../utils/languages';
import { useLanguage } from '../../context/LanguageContext';

interface SchemeFilterProps {
  searchTerm: string;
  selectedCountry: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
}

export const SchemeFilter: React.FC<SchemeFilterProps> = ({
  searchTerm,
  selectedCountry,
  selectedCategory,
  onSearchChange,
  onCountryChange,
  onCategoryChange,
  onClearFilters,
}) => {
  const { t } = useLanguage();

  const countryOptions = [
    { value: '', label: 'All Countries' },
    ...Object.entries(COUNTRIES).map(([code, name]) => ({
      value: code,
      label: name,
    })),
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...Object.entries(SCHEME_CATEGORIES).map(([key, category]) => ({
      value: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    })),
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filter Schemes</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search schemes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select
          label={t('schemes.filter.country')}
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          options={countryOptions}
        />

        <Select
          label={t('schemes.filter.category')}
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={categoryOptions}
        />
      </div>

      {(searchTerm || selectedCountry || selectedCategory) && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="sm"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};