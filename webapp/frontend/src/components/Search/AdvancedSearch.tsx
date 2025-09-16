import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Container,
} from '@mui/material';
import { Search as SearchIcon, Business, AttachMoney, Description } from '@mui/icons-material';

import EntitySearchForm from './EntitySearchForm';
import FinancialSearchForm from './FinancialSearchForm';
import FilingSearchForm from './FilingSearchForm';
// import SearchResults from './SearchResults';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdvancedSearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchResults(null); // Clear results when switching tabs
  };

  const handleSearch = async (searchParams: any, searchType: string) => {
    setIsLoading(true);
    try {
      // Mock search for testing - replace with actual API call
      setTimeout(() => {
        const mockResults = {
          data: [
            {
              filing_id: 'MOCK-001',
              filer_name: 'Test Lobbyist',
              firm_name: 'Test Firm',
              employer_name: 'Test Employer',
              report_date: '2024-01-15',
              total_amount: 15000,
              county: 'Los Angeles',
            },
            {
              filing_id: 'MOCK-002',
              filer_name: 'Demo Lobbyist',
              firm_name: 'Demo Firm',
              employer_name: 'Demo Corp',
              report_date: '2024-02-15',
              total_amount: 25000,
              county: 'San Francisco',
            },
          ],
          total: 2,
          page: 1,
          pageSize: 10,
        };
        setSearchResults(mockResults);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Search error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          <SearchIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Advanced Search
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Search California lobbying data by entity, financial details, or filing information
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<Business />}
            iconPosition="start"
            label="Entity Search"
            id="search-tab-0"
            aria-controls="search-tabpanel-0"
          />
          <Tab
            icon={<AttachMoney />}
            iconPosition="start"
            label="Financial Search"
            id="search-tab-1"
            aria-controls="search-tabpanel-1"
          />
          <Tab
            icon={<Description />}
            iconPosition="start"
            label="Filing Search"
            id="search-tab-2"
            aria-controls="search-tabpanel-2"
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <EntitySearchForm onSearch={(params) => handleSearch(params, 'entity')} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <FinancialSearchForm onSearch={(params) => handleSearch(params, 'financial')} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <FilingSearchForm onSearch={(params) => handleSearch(params, 'filing')} />
        </TabPanel>
      </Paper>

      {(searchResults || isLoading) && (
        <Paper sx={{ p: 3 }}>
          {isLoading ? (
            <Typography>Loading search results...</Typography>
          ) : (
            <div>
              <Typography variant="h6" gutterBottom>
                Search Results ({searchResults?.total || 0} found)
              </Typography>
              {searchResults?.data?.map((result: any, index: number) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="subtitle1">{result.filer_name}</Typography>
                  <Typography variant="body2">Firm: {result.firm_name}</Typography>
                  <Typography variant="body2">Amount: ${result.total_amount?.toLocaleString()}</Typography>
                  <Typography variant="body2">Date: {result.report_date}</Typography>
                </Box>
              )) || <Typography>No results found</Typography>}
            </div>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default AdvancedSearch;