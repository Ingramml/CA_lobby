import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
  Radio,
  RadioGroup,
  Grid,
  Button,
  Typography,
  Chip,
} from '@mui/material';
import { FilingSearchParams, DocumentType } from '../../types';

interface FilingSearchFormProps {
  onSearch: (params: FilingSearchParams) => void;
  loading?: boolean;
  initialParams?: Partial<FilingSearchParams>;
}

const FilingSearchForm: React.FC<FilingSearchFormProps> = ({
  onSearch,
  loading = false,
  initialParams = {},
}) => {
  const [searchParams, setSearchParams] = useState<FilingSearchParams>({
    filingId: '',
    amendmentTracking: false,
    documentTypes: [],
    filingStatus: 'All',
    latestAmendmentOnly: true,
    ...initialParams,
  });

  const documentTypeOptions = [
    {
      value: DocumentType.DISCLOSURE_FORMS,
      label: 'Disclosure Forms',
      description: 'Lobbying activity disclosure forms'
    },
    {
      value: DocumentType.REGISTRATION_FORMS,
      label: 'Registration Forms',
      description: 'Lobbyist registration documents'
    },
    {
      value: DocumentType.PAYMENT_RECORDS,
      label: 'Payment Records',
      description: 'Payment and compensation records'
    },
    {
      value: DocumentType.EMPLOYMENT_RECORDS,
      label: 'Employment Records',
      description: 'Lobbyist employment information'
    },
  ];

  const handleInputChange = (field: keyof FilingSearchParams, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDocumentTypeChange = (documentType: DocumentType, checked: boolean) => {
    const currentTypes = searchParams.documentTypes || [];
    if (checked) {
      handleInputChange('documentTypes', [...currentTypes, documentType]);
    } else {
      handleInputChange('documentTypes', currentTypes.filter(type => type !== documentType));
    }
  };

  const handleSearch = () => {
    onSearch(searchParams);
  };

  const handleClear = () => {
    const clearedParams: FilingSearchParams = {
      filingId: '',
      amendmentTracking: false,
      documentTypes: [],
      filingStatus: 'All',
      latestAmendmentOnly: true,
    };
    setSearchParams(clearedParams);
  };

  const hasSearchParams = Object.values(searchParams).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value !== false;
    return value && value !== 'All';
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filing Search
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Search specific filing documents and track amendments
      </Typography>

      <Grid container spacing={3}>
        {/* Document Filters */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Document Filters
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Filing ID"
            value={searchParams.filingId || ''}
            onChange={(e) => handleInputChange('filingId', e.target.value)}
            placeholder="Enter exact filing ID..."
            helperText="Search for a specific filing by ID number"
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={searchParams.amendmentTracking || false}
                onChange={(e) => handleInputChange('amendmentTracking', e.target.checked)}
              />
            }
            label="Enable Amendment Tracking"
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mt: 0.5 }}>
            Track all versions and amendments of filings
          </Typography>
        </Grid>

        {/* Document Types */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
            Document Types
          </Typography>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormGroup>
              <Grid container spacing={1}>
                {documentTypeOptions.map((option) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={option.value}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={searchParams.documentTypes?.includes(option.value) || false}
                          onChange={(e) => handleDocumentTypeChange(option.value, e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {option.label}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {option.description}
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
          </FormControl>
        </Grid>

        {/* Filing Status */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
            Filing Status
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <FormControl>
            <RadioGroup
              value={searchParams.filingStatus || 'All'}
              onChange={(e) => handleInputChange('filingStatus', e.target.value)}
              row
            >
              <FormControlLabel value="All" control={<Radio />} label="All Filings" />
              <FormControlLabel value="Original" control={<Radio />} label="Original Only" />
              <FormControlLabel value="Amended" control={<Radio />} label="Amended Only" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={searchParams.latestAmendmentOnly || false}
                onChange={(e) => handleInputChange('latestAmendmentOnly', e.target.checked)}
                disabled={searchParams.filingStatus === 'Original'}
              />
            }
            label="Latest Amendment Only"
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mt: 0.5 }}>
            Show only the most recent version of each filing
          </Typography>
        </Grid>

        {/* Current Search Summary */}
        {hasSearchParams && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mt: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Current Search Filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {searchParams.filingId && (
                  <Chip
                    label={`Filing ID: ${searchParams.filingId}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {searchParams.amendmentTracking && (
                  <Chip
                    label="Amendment Tracking: ON"
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                )}
                {searchParams.documentTypes && searchParams.documentTypes.length > 0 && (
                  <Chip
                    label={`Document Types: ${searchParams.documentTypes.length} selected`}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                )}
                {searchParams.filingStatus && searchParams.filingStatus !== 'All' && (
                  <Chip
                    label={`Status: ${searchParams.filingStatus}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {searchParams.latestAmendmentOnly && (
                  <Chip
                    label="Latest Amendment Only"
                    size="small"
                    variant="outlined"
                    color="success"
                  />
                )}
              </Box>
            </Box>
          </Grid>
        )}

        {/* Advanced Options */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Search Tips:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Filing IDs are typically 7-digit numbers (e.g., 1234567)
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Amendment tracking shows all versions of a filing with modification history
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Document type filters help narrow results to specific form types
            </Typography>
            <Typography variant="body2">
              • Use "Latest Amendment Only" to see the most current version of each filing
            </Typography>
          </Box>
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
              {loading ? 'Searching...' : 'Search Filings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilingSearchForm;