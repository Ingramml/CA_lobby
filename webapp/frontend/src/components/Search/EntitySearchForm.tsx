import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  Grid,
  Button,
  Chip,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useQuery } from '@tanstack/react-query';
import { EntitySearchParams, AutocompleteOption } from '../../types';
import apiService from '../../services/api';

interface EntitySearchFormProps {
  onSearch: (params: EntitySearchParams) => void;
  loading?: boolean;
  initialParams?: Partial<EntitySearchParams>;
}

const EntitySearchForm: React.FC<EntitySearchFormProps> = ({
  onSearch,
  loading = false,
  initialParams = {},
}) => {
  const [searchParams, setSearchParams] = useState<EntitySearchParams>({
    filerName: '',
    firmName: '',
    employerName: '',
    counties: [],
    cities: [],
    registrationStatus: 'All',
    registrationDateFrom: '',
    registrationDateTo: '',
    ...initialParams,
  });

  const [filerOptions, setFilerOptions] = useState<AutocompleteOption[]>([]);
  const [firmOptions, setFirmOptions] = useState<AutocompleteOption[]>([]);
  const [employerOptions, setEmployerOptions] = useState<AutocompleteOption[]>([]);

  // Fetch counties
  const { data: countiesData } = useQuery({
    queryKey: ['counties'],
    queryFn: async () => {
      const response = await apiService.getCounties();
      return response.data;
    },
  });

  // Fetch cities when counties change
  const { data: citiesData } = useQuery({
    queryKey: ['cities', searchParams.counties],
    queryFn: async () => {
      if (!searchParams.counties || searchParams.counties.length === 0) {
        return [];
      }
      // For demo, we'll use the first county
      const response = await apiService.getCities(searchParams.counties[0]);
      return response.data;
    },
    enabled: searchParams.counties && searchParams.counties.length > 0,
  });

  const handleInputChange = (field: keyof EntitySearchParams, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAutocompleteSearch = async (field: 'filers' | 'firms' | 'employers', query: string) => {
    if (query.length < 2) return [];

    try {
      const response = await apiService.getAutocompleteSuggestions(field, query);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${field} suggestions:`, error);
      return [];
    }
  };

  const handleSearch = () => {
    onSearch(searchParams);
  };

  const handleClear = () => {
    const clearedParams: EntitySearchParams = {
      filerName: '',
      firmName: '',
      employerName: '',
      counties: [],
      cities: [],
      registrationStatus: 'All',
      registrationDateFrom: '',
      registrationDateTo: '',
    };
    setSearchParams(clearedParams);
  };

  const hasSearchParams = Object.values(searchParams).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value && value !== 'All';
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Entity Search
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Search for lobbying entities including filers, firms, and employers
      </Typography>

      <Grid container spacing={3}>
        {/* Filer Information */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Filer Information
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            options={filerOptions}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
            onInputChange={async (event, newInputValue) => {
              if (newInputValue) {
                const suggestions = await handleAutocompleteSearch('filers', newInputValue);
                setFilerOptions(suggestions);
              }
            }}
            onChange={(event, newValue) => {
              const value = typeof newValue === 'string' ? newValue : newValue?.label || '';
              handleInputChange('filerName', value);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filer Name"
                variant="outlined"
                placeholder="Enter filer name..."
                helperText="Search for individual lobbyist names"
              />
            )}
            freeSolo
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            options={firmOptions}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
            onInputChange={async (event, newInputValue) => {
              if (newInputValue) {
                const suggestions = await handleAutocompleteSearch('firms', newInputValue);
                setFirmOptions(suggestions);
              }
            }}
            onChange={(event, newValue) => {
              const value = typeof newValue === 'string' ? newValue : newValue?.label || '';
              handleInputChange('firmName', value);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Firm Name"
                variant="outlined"
                placeholder="Enter firm name..."
                helperText="Search for lobbying firm names"
              />
            )}
            freeSolo
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            options={employerOptions}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
            onInputChange={async (event, newInputValue) => {
              if (newInputValue) {
                const suggestions = await handleAutocompleteSearch('employers', newInputValue);
                setEmployerOptions(suggestions);
              }
            }}
            onChange={(event, newValue) => {
              const value = typeof newValue === 'string' ? newValue : newValue?.label || '';
              handleInputChange('employerName', value);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Employer Name"
                variant="outlined"
                placeholder="Enter employer name..."
                helperText="Search for employer organizations"
              />
            )}
            freeSolo
          />
        </Grid>

        {/* Geographic Filters */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
            Geographic Filters
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            multiple
            options={countiesData || []}
            getOptionLabel={(option) => option.label}
            value={countiesData?.filter(county => searchParams.counties?.includes(county.value)) || []}
            onChange={(event, newValue) => {
              const countyValues = newValue.map(option => option.value);
              handleInputChange('counties', countyValues);
              // Clear cities when counties change
              handleInputChange('cities', []);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Counties"
                placeholder="Select counties..."
                helperText="Filter by California counties"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.label}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            multiple
            options={citiesData || []}
            getOptionLabel={(option) => option.label}
            value={citiesData?.filter(city => searchParams.cities?.includes(city.value)) || []}
            onChange={(event, newValue) => {
              const cityValues = newValue.map(option => option.value);
              handleInputChange('cities', cityValues);
            }}
            disabled={!searchParams.counties || searchParams.counties.length === 0}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cities"
                placeholder="Select cities..."
                helperText={
                  !searchParams.counties || searchParams.counties.length === 0
                    ? "Select counties first"
                    : "Filter by cities in selected counties"
                }
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.label}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </Grid>

        {/* Registration Status */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
            Registration Status
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={searchParams.registrationStatus === 'Active'}
                    onChange={(e) => {
                      handleInputChange('registrationStatus', e.target.checked ? 'Active' : 'All');
                    }}
                  />
                }
                label="Active registrations only"
              />
            </FormGroup>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DatePicker
            label="Registration From"
            value={searchParams.registrationDateFrom ? new Date(searchParams.registrationDateFrom) : null}
            onChange={(newValue) => {
              handleInputChange('registrationDateFrom', newValue?.toISOString().split('T')[0] || '');
            }}
            slotProps={{
              textField: {
                variant: 'outlined',
                helperText: 'Start date for registration filter',
                fullWidth: true,
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DatePicker
            label="Registration To"
            value={searchParams.registrationDateTo ? new Date(searchParams.registrationDateTo) : null}
            onChange={(newValue) => {
              handleInputChange('registrationDateTo', newValue?.toISOString().split('T')[0] || '');
            }}
            slotProps={{
              textField: {
                variant: 'outlined',
                helperText: 'End date for registration filter',
                fullWidth: true,
              },
            }}
          />
        </Grid>

        {/* Search Actions */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={loading || !hasSearchParams}
            >
              Clear Filters
            </Button>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              size="large"
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Searching...' : 'Search Entities'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EntitySearchForm;