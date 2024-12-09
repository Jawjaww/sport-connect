import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  IconButton,
  Divider,
  Card,
  CardContent,
  Button,
  Badge,
  Chip,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  SportsScore as MatchIcon,
  EmojiEvents as TournamentIcon,
  Group as TeamIcon,
  Assessment as PerformanceIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@services/supabase';
import type { Notification } from '../../types';
import { requestNotificationPermission } from '@services/firebase';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  useEffect(() => {
    fetchNotifications();
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const permission = await Notification.permission;
    setNotificationPermission(permission);
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleEnableNotifications = async () => {
    const { token, error } = await requestNotificationPermission();
    if (token) {
      // Sauvegarder le token dans Supabase
      try {
        const { error: tokenError } = await supabase
          .from('user_notification_tokens')
          .upsert([
            {
              user_id: (await supabase.auth.getUser()).data.user?.id,
              token,
              device_type: 'web',
            },
          ]);

        if (tokenError) throw tokenError;
        setNotificationPermission('granted');
      } catch (error) {
        console.error('Error saving notification token:', error);
      }
    } else if (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(notifications.filter(
        notification => notification.id !== notificationId
      ));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <MatchIcon />;
      case 'tournament':
        return <TournamentIcon />;
      case 'team':
        return <TeamIcon />;
      case 'performance':
        return <PerformanceIcon />;
      default:
        return <MatchIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'match':
        return 'primary';
      case 'tournament':
        return 'secondary';
      case 'team':
        return 'success';
      case 'performance':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Centre de notifications</Typography>
            {notificationPermission !== 'granted' && (
              <Button
                variant="contained"
                onClick={handleEnableNotifications}
              >
                Activer les notifications
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <List>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              {index > 0 && <Divider />}
              <ListItem
                secondaryAction={
                  <Box>
                    {!notification.read && (
                      <IconButton
                        edge="end"
                        aria-label="mark as read"
                        onClick={() => markAsRead(notification.id)}
                        sx={{ mr: 1 }}
                      >
                        <DoneIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={notification.read}
                  >
                    <Avatar sx={{ bgcolor: getNotificationColor(notification.type) }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        component="span"
                        variant="body1"
                        color={notification.read ? 'text.secondary' : 'text.primary'}
                      >
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.type}
                        size="small"
                        color={getNotificationColor(notification.type) as any}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="div"
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {format(new Date(notification.created_at), 'PPP à HH:mm', { locale: fr })}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
          {notifications.length === 0 && (
            <ListItem>
              <ListItemText
                primary={
                  <Typography align="center" color="text.secondary">
                    Aucune notification
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Card>
    </Box>
  );
};

export default NotificationsPage;
