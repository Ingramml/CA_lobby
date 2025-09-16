import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  TrendingUp,
  Business,
  LocationOn,
  Timeline,
  Download,
  Visibility,
  Build,
} from '@mui/icons-material';

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
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const preBuiltReports = [
    {
      id: 1,
      title: "Top Lobbyist Payments by County",
      description: "Analysis of highest lobbying payments organized by California counties",
      category: "Financial Analysis",
      icon: <TrendingUp color="primary" />,
      lastUpdated: "2024-01-15",
    },
    {
      id: 2,
      title: "Most Active Lobbying Firms",
      description: "Ranking of lobbying firms by number of active registrations",
      category: "Entity Analysis",
      icon: <Business color="primary" />,
      lastUpdated: "2024-01-10",
    },
    {
      id: 3,
      title: "County-by-County Spending Analysis",
      description: "Geographic breakdown of lobbying expenditures across California",
      category: "Geographic Reports",
      icon: <LocationOn color="primary" />,
      lastUpdated: "2024-01-12",
    },
    {
      id: 4,
      title: "Monthly Payment Trends",
      description: "Time-series analysis of lobbying payments over time",
      category: "Time-Series Reports",
      icon: <Timeline color="primary" />,
      lastUpdated: "2024-01-08",
    },
  ];

  const reportCategories = [
    "Financial Analysis Reports",
    "Entity Analysis Reports",
    "Geographic Reports",
    "Time-Series Reports"
  ];

  const handleRunReport = (reportId: number) => {
    console.log(`Running report ${reportId}`);
    // Mock report generation
    alert(`Report ${reportId} is being generated. This would normally take you to the report results.`);
  };

  const handleDownloadReport = (reportId: number) => {
    console.log(`Downloading report ${reportId}`);
    alert(`Report ${reportId} download started. This would normally download a PDF/Excel file.`);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          <ReportIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Reports & Analytics
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Pre-built reports and custom analytics for California lobbying data
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
            icon={<ReportIcon />}
            iconPosition="start"
            label="Pre-Built Reports"
            id="reports-tab-0"
            aria-controls="reports-tabpanel-0"
          />
          <Tab
            icon={<Build />}
            iconPosition="start"
            label="Custom Report Builder"
            id="reports-tab-1"
            aria-controls="reports-tabpanel-1"
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Pre-Built Reports
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Ready-to-run analysis reports based on common lobbying transparency needs
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {preBuiltReports.map((report) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={report.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {report.icon}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {report.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {report.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={report.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Last updated: {report.lastUpdated}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleRunReport(report.id)}
                    >
                      Run Report
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      Download
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Build sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Custom Report Builder
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Create custom reports with drag-and-drop interface, custom filters, and visualizations
            </Typography>
            <Button variant="contained" color="primary" size="large">
              Launch Report Builder
            </Button>

            <Box sx={{ mt: 4, textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Custom Report Features:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Data Source Selection"
                    secondary="Choose from multiple data tables and views"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Custom Filters"
                    secondary="Apply date ranges, entity filters, geographic constraints"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Visualizations"
                    secondary="Charts, graphs, heat maps, and network diagrams"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Export Options"
                    secondary="PDF, Excel, CSV formats with scheduling options"
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Reports;