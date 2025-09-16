import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Skeleton,
} from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactElement<SvgIconComponent>;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    label?: string;
  };
  loading?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  loading = false,
  onClick,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case 'up':
        return <TrendingUp color="success" fontSize="small" />;
      case 'down':
        return <TrendingDown color="error" fontSize="small" />;
      default:
        return <TrendingFlat color="info" fontSize="small" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'textSecondary';

    switch (trend.direction) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'info.main';
    }
  };

  if (loading) {
    return (
      <Card
        sx={{
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          '&:hover': onClick ? {
            transform: 'translateY(-2px)',
            boxShadow: 4,
          } : {},
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          <Skeleton variant="text" width={80} height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={150} height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div" color="textSecondary" fontWeight={500}>
            {title}
          </Typography>
          <IconButton
            size="small"
            sx={{
              bgcolor: `${color}.main`,
              color: `${color}.contrastText`,
              '&:hover': {
                bgcolor: `${color}.dark`,
              },
            }}
          >
            {icon}
          </IconButton>
        </Box>

        <Typography
          variant="h3"
          component="div"
          fontWeight="bold"
          color="text.primary"
          sx={{ mb: 1 }}
        >
          {formatValue(value)}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {getTrendIcon()}
            <Typography
              variant="body2"
              sx={{
                ml: 0.5,
                color: getTrendColor(),
                fontWeight: 500,
              }}
            >
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </Typography>
            {trend.label && (
              <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                {trend.label}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;