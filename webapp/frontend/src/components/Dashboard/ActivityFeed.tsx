import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Box,
  Divider,
  Button,
  Skeleton,
} from '@mui/material';
import {
  Description,
  Edit,
  PersonAdd,
  Visibility,
  ArrowForward,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { ActivityItem } from '../../types';

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
  maxItems = 5,
  onViewAll,
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconProps = { fontSize: 'small' as const };

    switch (type) {
      case 'Filing':
        return <Description {...iconProps} />;
      case 'Amendment':
        return <Edit {...iconProps} />;
      case 'Registration':
        return <PersonAdd {...iconProps} />;
      default:
        return <Description {...iconProps} />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'Filing':
        return 'primary.main';
      case 'Amendment':
        return 'warning.main';
      case 'Registration':
        return 'success.main';
      default:
        return 'grey.500';
    }
  };

  const renderActivitySkeleton = () => (
    <>
      {Array.from({ length: maxItems }).map((_, index) => (
        <ListItem key={index} alignItems="flex-start">
          <ListItemIcon sx={{ mt: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
          </ListItemIcon>
          <ListItemText
            primary={<Skeleton variant="text" width="80%" height={20} />}
            secondary={
              <Box>
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
            }
          />
        </ListItem>
      ))}
    </>
  );

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Recent Activity"
        action={
          onViewAll && !loading && (
            <Button
              size="small"
              endIcon={<ArrowForward />}
              onClick={onViewAll}
            >
              View All
            </Button>
          )
        }
        titleTypographyProps={{
          variant: 'h6',
          fontWeight: 'bold',
        }}
      />

      <CardContent sx={{ pt: 0, flex: 1, overflow: 'auto' }}>
        {loading ? (
          <List dense>
            {renderActivitySkeleton()}
          </List>
        ) : displayedActivities.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              textAlign: 'center',
            }}
          >
            <Visibility sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              No recent activity found
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ pt: 0 }}>
            {displayedActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemIcon sx={{ mt: 0.5, minWidth: 40 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: getActivityColor(activity.type),
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{ fontWeight: 500, mb: 0.5 }}
                      >
                        {activity.description}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          component="div"
                        >
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          component="div"
                        >
                          {format(activity.timestamp, 'MMM d, yyyy • h:mm a')}
                        </Typography>
                        {activity.filingId && (
                          <Typography
                            variant="caption"
                            color="primary.main"
                            component="div"
                            sx={{ mt: 0.5, fontWeight: 500 }}
                          >
                            Filing ID: {activity.filingId}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < displayedActivities.length - 1 && (
                  <Divider variant="inset" component="li" sx={{ ml: 5 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}

        {!loading && activities.length > maxItems && (
          <Box sx={{ textAlign: 'center', pt: 2 }}>
            <Typography variant="caption" color="textSecondary">
              Showing {maxItems} of {activities.length} activities
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;