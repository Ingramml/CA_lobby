import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Alert,
} from '@mui/material';
import {
  Description,
  AttachMoney,
  People,
  Schedule,
  Search,
  Assessment,
  TrendingUp,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import StatCard from './StatCard';
import ActivityFeed from './ActivityFeed';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, permissions } = useAuth();

  const {
    data: dashboardStats,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiService.getDashboardStats();
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });

  const handleStatCardClick = (route: string) => {
    if (permissions.canRunAdvancedSearches) {
      navigate(route);
    }
  };

  const handleViewAllActivity = () => {
    navigate('/activity');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'search':
        navigate('/search');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'entities':
        navigate('/search?tab=entities');
        break;
      case 'financial':
        navigate('/search?tab=financial');
        break;
      default:
        break;
    }
  };

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load dashboard data. Please try again.
          <Button size="small" onClick={() => refetch()} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome{user?.name ? `, ${user.name}` : ''}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          California Lobbying Transparency Dashboard
        </Typography>
        {user && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Access Level: <strong>{user.role}</strong>
          </Typography>
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Filings"
            value={dashboardStats?.totalFilings || 0}
            subtitle="Active lobbying filings"
            icon={<Description />}
            color="primary"
            loading={isLoading}
            onClick={() => handleStatCardClick('/search?tab=filings')}
            trend={{
              value: 5.2,
              direction: 'up',
              label: 'vs last month'
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Payments"
            value={`$${(dashboardStats?.totalPayments || 0).toLocaleString()}`}
            subtitle="Reported payments"
            icon={<AttachMoney />}
            color="success"
            loading={isLoading}
            onClick={() => handleStatCardClick('/search?tab=financial')}
            trend={{
              value: 12.8,
              direction: 'up',
              label: 'vs last quarter'
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Lobbyists"
            value={dashboardStats?.activeLobbyists || 0}
            subtitle="Registered lobbyists"
            icon={<People />}
            color="info"
            loading={isLoading}
            onClick={() => handleStatCardClick('/search?tab=entities')}
            trend={{
              value: -2.1,
              direction: 'down',
              label: 'vs last month'
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Latest Period"
            value={dashboardStats?.latestPeriod || 'N/A'}
            subtitle="Most recent reporting"
            icon={<Schedule />}
            color="warning"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {permissions.canRunAdvancedSearches && (
                <Button
                  variant="outlined"
                  startIcon={<Search />}
                  onClick={() => handleQuickAction('search')}
                  fullWidth
                >
                  Advanced Search
                </Button>
              )}

              {permissions.canRunCustomReports && (
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  onClick={() => handleQuickAction('reports')}
                  fullWidth
                >
                  Generate Reports
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={<People />}
                onClick={() => handleQuickAction('entities')}
                fullWidth
              >
                Browse Entities
              </Button>

              <Button
                variant="outlined"
                startIcon={<TrendingUp />}
                onClick={() => handleQuickAction('financial')}
                fullWidth
              >
                Financial Analysis
              </Button>
            </Box>

            {!permissions.canRunAdvancedSearches && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Sign in for full access to search and reporting features.
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity Feed */}
        <Grid size={{ xs: 12, md: 8 }}>
          <ActivityFeed
            activities={dashboardStats?.recentActivity || []}
            loading={isLoading}
            maxItems={6}
            onViewAll={handleViewAllActivity}
          />
        </Grid>
      </Grid>

      {/* Additional Info */}
      {dashboardStats && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Data Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Last Updated
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {new Date().toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Data Source
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                CA Secretary of State
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Coverage Period
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                2020 - Present
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Update Frequency
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                Daily
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard;