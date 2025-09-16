import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Button,
  Typography,
  Slider,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useQuery } from '@tanstack/react-query';
import { FinancialSearchParams, PaymentType } from '../../types';
import apiService from '../../services/api';

interface FinancialSearchFormProps {
  onSearch: (params: FinancialSearchParams) => void;
  loading?: boolean;
  initialParams?: Partial<FinancialSearchParams>;
}

const FinancialSearchForm: React.FC<FinancialSearchFormProps> = ({
  onSearch,
  loading = false,
  initialParams = {},
}) => {
  const [searchParams, setSearchParams] = useState<FinancialSearchParams>({
    amountMin: undefined,
    amountMax: undefined,
    paymentTypes: [],
    reportDateFrom: '',
    reportDateTo: '',
    paymentDateFrom: '',
    paymentDateTo: '',
    filingPeriod: '',
    ...initialParams,
  });

  const [amountRange, setAmountRange] = useState<[number, number]>([0, 1000000]);
  const [useSlider, setUseSlider] = useState(true);

  // Fetch filing periods
  const { data: filingPeriods } = useQuery({
    queryKey: ['filing-periods'],
    queryFn: async () => {
      const response = await apiService.getFilingPeriods();
      return response.data;
    },
  });

  const paymentTypeOptions = [
    { value: PaymentType.LOBBYING_FEES, label: 'Lobbying Fees', description: 'Direct lobbying compensation' },
    { value: PaymentType.REIMBURSEMENTS, label: 'Reimbursements', description: 'Expense reimbursements' },
    { value: PaymentType.ADVANCES, label: 'Advances', description: 'Advance payments' },
    { value: PaymentType.OTHER_PAYMENTS, label: 'Other Payments', description: 'Miscellaneous payments' },
  ];

  const handleInputChange = (field: keyof FinancialSearchParams, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAmountRangeChange = (event: Event, newValue: number | number[]) => {
    const range = newValue as [number, number];
    setAmountRange(range);
    handleInputChange('amountMin', range[0]);
    handleInputChange('amountMax', range[1]);
  };

  const handlePaymentTypeChange = (paymentType: PaymentType, checked: boolean) => {
    const currentTypes = searchParams.paymentTypes || [];
    if (checked) {
      handleInputChange('paymentTypes', [...currentTypes, paymentType]);
    } else {
      handleInputChange('paymentTypes', currentTypes.filter(type => type !== paymentType));
    }
  };

  const handleSearch = () => {
    const finalParams = { ...searchParams };

    // Use slider values for amount if slider is being used
    if (useSlider) {
      finalParams.amountMin = amountRange[0] > 0 ? amountRange[0] : undefined;
      finalParams.amountMax = amountRange[1] < 1000000 ? amountRange[1] : undefined;
    }

    onSearch(finalParams);
  };

  const handleClear = () => {
    const clearedParams: FinancialSearchParams = {
      amountMin: undefined,
      amountMax: undefined,
      paymentTypes: [],
      reportDateFrom: '',
      reportDateTo: '',
      paymentDateFrom: '',
      paymentDateTo: '',
      filingPeriod: '',
    };
    setSearchParams(clearedParams);
    setAmountRange([0, 1000000]);
  };

  const hasSearchParams = Object.values(searchParams).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== '' && value !== undefined;
  }) || amountRange[0] > 0 || amountRange[1] < 1000000;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Financial Search
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Search and analyze lobbying payments, fees, and financial transactions
      </Typography>

      <Grid container spacing={3}>
        {/* Payment Amount Filters */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Payment Amount Range
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ px: 2 }}>
            <Typography gutterBottom>
              Amount: {formatAmount(amountRange[0])} - {formatAmount(amountRange[1])}
            </Typography>
            <Slider
              value={amountRange}
              onChange={handleAmountRangeChange}
              valueLabelDisplay="auto"
              valueLabelFormat={formatAmount}
              min={0}
              max={1000000}
              step={1000}
              sx={{ mt: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="textSecondary">$0</Typography>
              <Typography variant="caption" color="textSecondary">$1,000,000+</Typography>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Minimum Amount"
            type="number"
            value={searchParams.amountMin || ''}
            onChange={(e) => handleInputChange('amountMin', e.target.value ? parseFloat(e.target.value) : undefined)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            helperText="Enter exact minimum amount"
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Maximum Amount"
            type="number"
            value={searchParams.amountMax || ''}
            onChange={(e) => handleInputChange('amountMax', e.target.value ? parseFloat(e.target.value) : undefined)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            helperText="Enter exact maximum amount"
            fullWidth
          />
        </Grid>

        {/* Payment Types */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
            Payment Types
          </Typography>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormGroup>
              <Grid container spacing={2}>
                {paymentTypeOptions.map((option) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={option.value}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={searchParams.paymentTypes?.includes(option.value) || false}
                          onChange={(e) => handlePaymentTypeChange(option.value, e.target.checked)}
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

        {/* Date Filters */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
            Date Filters
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DatePicker
            label="Report Date From"
            value={searchParams.reportDateFrom ? new Date(searchParams.reportDateFrom) : null}
            onChange={(newValue) => {
              handleInputChange('reportDateFrom', newValue?.toISOString().split('T')[0] || '');
            }}
            slotProps={{
              textField: {
                variant: 'outlined',
                helperText: 'Start date for report period',
                fullWidth: true,
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DatePicker
            label="Report Date To"
            value={searchParams.reportDateTo ? new Date(searchParams.reportDateTo) : null}
            onChange={(newValue) => {
              handleInputChange('reportDateTo', newValue?.toISOString().split('T')[0] || '');
            }}
            slotProps={{
              textField: {
                variant: 'outlined',
                helperText: 'End date for report period',
                fullWidth: true,
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DatePicker
            label="Payment Date From"
            value={searchParams.paymentDateFrom ? new Date(searchParams.paymentDateFrom) : null}
            onChange={(newValue) => {
              handleInputChange('paymentDateFrom', newValue?.toISOString().split('T')[0] || '');
            }}
            slotProps={{
              textField: {
                variant: 'outlined',
                helperText: 'Start date for actual payments',
                fullWidth: true,
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DatePicker
            label="Payment Date To"
            value={searchParams.paymentDateTo ? new Date(searchParams.paymentDateTo) : null}
            onChange={(newValue) => {
              handleInputChange('paymentDateTo', newValue?.toISOString().split('T')[0] || '');
            }}
            slotProps={{
              textField: {
                variant: 'outlined',
                helperText: 'End date for actual payments',
                fullWidth: true,
              },
            }}
          />
        </Grid>

        {/* Filing Period */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            options={filingPeriods || []}
            getOptionLabel={(option) => option.label}
            value={filingPeriods?.find(period => period.value === searchParams.filingPeriod) || null}
            onChange={(event, newValue) => {
              handleInputChange('filingPeriod', newValue?.value || '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filing Period"
                placeholder="Select a filing period..."
                helperText="Filter by specific reporting period"
              />
            )}
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
              {loading ? 'Searching...' : 'Search Payments'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialSearchForm;