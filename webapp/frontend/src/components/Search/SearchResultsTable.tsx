import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Typography,
  Checkbox,
  Toolbar,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  FileDownload as ExportIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { SearchResults, LobbyingFiling, ExportOptions } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SearchResultsTableProps {
  results: SearchResults;
  searchType: 'entities' | 'financial' | 'filings';
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof LobbyingFiling;

const SearchResultsTable: React.FC<SearchResultsTableProps> = ({
  results,
  searchType,
  onPageChange,
  onPageSizeChange,
  loading = false,
}) => {
  const { permissions } = useAuth();
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('report_date');
  const [selected, setSelected] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = results.data.map((item) => item.filing_id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, filingId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(filingId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const handleViewDetails = (filingId: string) => {
    // Navigate to filing details page
    window.open(`/filing/${filingId}`, '_blank');
    handleMenuClose();
  };

  const handleExportRow = (filingId: string) => {
    const rowData = results.data.filter(item => item.filing_id === filingId);
    handleExport(rowData);
    handleMenuClose();
  };

  const handleExport = (data: LobbyingFiling[]) => {
    if (!permissions.canExportLimited) {
      alert('Export permission required');
      return;
    }

    // Create CSV content
    const headers = getColumnHeaders();
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header =>
        formatCellValueForExport(row, header.toLowerCase().replace(' ', '_') as keyof LobbyingFiling)
      ).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ca_lobby_${searchType}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatCellValueForExport = (row: LobbyingFiling, key: keyof LobbyingFiling): string => {
    const value = row[key];
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
    return String(value);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getColumnHeaders = (): string[] => {
    switch (searchType) {
      case 'entities':
        return ['Filing ID', 'Filer Name', 'Firm Name', 'Report Date', 'Total Amount', 'Status'];
      case 'financial':
        return ['Filing ID', 'Filer Name', 'Employer', 'Fees', 'Reimbursements', 'Advances', 'Total', 'Report Date'];
      case 'filings':
        return ['Filing ID', 'Filer Name', 'Firm Name', 'Report Date', 'Amendment', 'Status', 'Total Amount'];
      default:
        return [];
    }
  };

  const renderTableHeaders = () => {
    const headers = getColumnHeaders();
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={selected.length > 0 && selected.length < results.data.length}
              checked={results.data.length > 0 && selected.length === results.data.length}
              onChange={handleSelectAllClick}
              inputProps={{
                'aria-label': 'select all results',
              }}
            />
          </TableCell>
          {headers.map((header) => (
            <TableCell key={header}>
              <TableSortLabel
                active={orderBy === header.toLowerCase().replace(' ', '_')}
                direction={orderBy === header.toLowerCase().replace(' ', '_') ? order : 'asc'}
                onClick={() => handleRequestSort(header.toLowerCase().replace(' ', '_') as OrderBy)}
              >
                {header}
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
    );
  };

  const renderEntityRow = (row: LobbyingFiling) => (
    <>
      <TableCell>{row.filing_id}</TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {row.filer_name}
        </Typography>
      </TableCell>
      <TableCell>{row.firm_name || '-'}</TableCell>
      <TableCell>{formatDate(row.report_date)}</TableCell>
      <TableCell>{formatCurrency(row.total_amount)}</TableCell>
      <TableCell>
        <Chip
          label={row.status}
          size="small"
          color={row.status === 'Active' ? 'success' : 'default'}
        />
      </TableCell>
    </>
  );

  const renderFinancialRow = (row: LobbyingFiling) => (
    <>
      <TableCell>{row.filing_id}</TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {row.filer_name}
        </Typography>
      </TableCell>
      <TableCell>{row.employer_name || '-'}</TableCell>
      <TableCell>{formatCurrency(row.fees_amount || 0)}</TableCell>
      <TableCell>{formatCurrency(row.reimbursement_amount || 0)}</TableCell>
      <TableCell>{formatCurrency(row.advance_amount || 0)}</TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="bold">
          {formatCurrency(row.total_amount)}
        </Typography>
      </TableCell>
      <TableCell>{formatDate(row.report_date)}</TableCell>
    </>
  );

  const renderFilingRow = (row: LobbyingFiling) => (
    <>
      <TableCell>{row.filing_id}</TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {row.filer_name}
        </Typography>
      </TableCell>
      <TableCell>{row.firm_name || '-'}</TableCell>
      <TableCell>{formatDate(row.report_date)}</TableCell>
      <TableCell>
        {row.amendment_id > 0 ? (
          <Chip label={`Amendment ${row.amendment_id}`} size="small" color="warning" />
        ) : (
          <Chip label="Original" size="small" color="primary" />
        )}
      </TableCell>
      <TableCell>
        <Chip
          label={row.status}
          size="small"
          color={row.status === 'Active' ? 'success' : 'default'}
        />
      </TableCell>
      <TableCell>{formatCurrency(row.total_amount)}</TableCell>
    </>
  );

  const renderTableRow = (row: LobbyingFiling, index: number) => {
    const isItemSelected = selected.indexOf(row.filing_id) !== -1;

    return (
      <TableRow
        hover
        onClick={(event) => handleClick(event, row.filing_id)}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={row.filing_id}
        selected={isItemSelected}
      >
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={isItemSelected}
            inputProps={{
              'aria-labelledby': `enhanced-table-checkbox-${index}`,
            }}
          />
        </TableCell>
        {searchType === 'entities' && renderEntityRow(row)}
        {searchType === 'financial' && renderFinancialRow(row)}
        {searchType === 'filings' && renderFilingRow(row)}
        <TableCell align="right">
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              handleMenuClick(event, row.filing_id);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      {/* Toolbar */}
      {selected.length > 0 && (
        <Toolbar sx={{ pl: 2, pr: 1 }}>
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {selected.length} selected
          </Typography>
          {permissions.canExportLimited && (
            <Tooltip title="Export selected">
              <IconButton
                onClick={() => {
                  const selectedData = results.data.filter(item => selected.includes(item.filing_id));
                  handleExport(selectedData);
                }}
              >
                <ExportIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      )}

      {/* Results Summary */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Search Results - {searchType.charAt(0).toUpperCase() + searchType.slice(1)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Found {results.totalCount.toLocaleString()} results
          {selected.length > 0 && ` (${selected.length} selected)`}
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
          {renderTableHeaders()}
          <TableBody>
            {results.data.map((row, index) => renderTableRow(row, index))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={results.totalCount}
        rowsPerPage={Math.ceil(results.totalCount / results.totalPages) || 25}
        page={results.currentPage - 1}
        onPageChange={(event, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={(event) => onPageSizeChange(parseInt(event.target.value, 10))}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedRowId && handleViewDetails(selectedRowId)}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {permissions.canExportLimited && (
          <MenuItem onClick={() => selectedRowId && handleExportRow(selectedRowId)}>
            <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Export Row
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default SearchResultsTable;