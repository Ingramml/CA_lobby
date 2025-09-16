import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  Search,
  Assessment,
  People,
  Settings,
  BarChart,
  LocationOn,
  Schedule,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, drawerWidth = 280 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, permissions } = useAuth();

  const mainMenuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      requiresAuth: true,
      permission: 'canReadBasicData' as const,
    },
    {
      text: 'Advanced Search',
      icon: <Search />,
      path: '/search',
      requiresAuth: true,
      permission: 'canRunAdvancedSearches' as const,
    },
    {
      text: 'Reports',
      icon: <Assessment />,
      path: '/reports',
      requiresAuth: true,
      permission: 'canRunCustomReports' as const,
    },
  ];

  const reportMenuItems = [
    {
      text: 'Financial Analysis',
      icon: <BarChart />,
      path: '/reports/financial',
      requiresAuth: true,
      permission: 'canRunCustomReports' as const,
    },
    {
      text: 'Entity Analysis',
      icon: <People />,
      path: '/reports/entities',
      requiresAuth: true,
      permission: 'canRunCustomReports' as const,
    },
    {
      text: 'Geographic Reports',
      icon: <LocationOn />,
      path: '/reports/geographic',
      requiresAuth: true,
      permission: 'canRunCustomReports' as const,
    },
    {
      text: 'Time Series',
      icon: <Schedule />,
      path: '/reports/timeseries',
      requiresAuth: true,
      permission: 'canRunCustomReports' as const,
    },
  ];

  const adminMenuItems = [
    {
      text: 'User Management',
      icon: <AdminPanelSettings />,
      path: '/admin/users',
      requiresAuth: true,
      permission: 'canManageUsers' as const,
    },
    {
      text: 'System Settings',
      icon: <Settings />,
      path: '/admin/settings',
      requiresAuth: true,
      permission: 'canAccessSystemSettings' as const,
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const canShowItem = (item: { permission?: keyof typeof permissions; requiresAuth?: boolean }) => {
    if (!item.requiresAuth) return true;
    if (!user && item.requiresAuth) return false;
    if (item.permission) {
      return permissions[item.permission];
    }
    return true;
  };

  const renderMenuSection = (title: string, items: { text: string; icon: React.ReactNode; path: string; requiresAuth?: boolean; permission?: keyof typeof permissions; }[], showDivider: boolean = true) => (
    <>
      {title && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="overline" color="textSecondary" fontWeight="bold">
            {title}
          </Typography>
        </Box>
      )}
      <List dense>
        {items
          .filter(canShowItem)
          .map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActiveRoute(item.path)}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 2,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActiveRoute(item.path) ? 'bold' : 'normal',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
      {showDivider && <Divider sx={{ my: 1 }} />}
    </>
  );

  const drawerContent = (
    <>
      <Toolbar />
      <Box sx={{ overflow: 'auto', height: '100%' }}>
        {/* User Info Section */}
        {user && (
          <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="body2" fontWeight="bold">
              {user.name}
            </Typography>
            <Chip
              label={user.role}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ mt: 0.5 }}
            />
          </Box>
        )}

        {/* Main Navigation */}
        {renderMenuSection('', mainMenuItems)}

        {/* Reports Section */}
        {permissions.canRunCustomReports && renderMenuSection('Reports', reportMenuItems)}

        {/* Admin Section */}
        {(permissions.canManageUsers || permissions.canAccessSystemSettings) && (
          renderMenuSection('Administration', adminMenuItems, false)
        )}

        {/* Footer Info */}
        <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16, textAlign: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            California Lobbying Transparency Portal
          </Typography>
          <Typography variant="caption" display="block" color="textSecondary">
            Version 1.0.0
          </Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      sx={{
        display: { xs: 'block', sm: 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;