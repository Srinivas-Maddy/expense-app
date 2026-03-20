import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type NotificationType = 'alert' | 'info' | 'success' | 'warning';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
};

const TYPE_STYLES: Record<NotificationType, { bg: string; text: string; label: string; dot: string }> = {
  alert: { bg: '#fef2f2', text: '#991b1b', label: 'Alert', dot: '#ef4444' },
  warning: { bg: '#fffbeb', text: '#92400e', label: 'Warning', dot: '#f59e0b' },
  info: { bg: '#eff6ff', text: '#1e40af', label: 'Info', dot: '#3b82f6' },
  success: { bg: '#ecfdf5', text: '#065f46', label: 'Success', dot: '#10b981' },
};

const PLACEHOLDER_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Budget Alert',
    message: 'You have used 92% of your Food & Dining budget this month.',
    type: 'alert',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'Recurring Expense Due',
    message: 'Netflix ($15.99) will be charged tomorrow.',
    type: 'warning',
    timestamp: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    title: 'Income Recorded',
    message: 'Salary payment of $5,200.00 has been logged for March 2026.',
    type: 'success',
    timestamp: 'Yesterday',
    read: false,
  },
  {
    id: '4',
    title: 'Monthly Report Ready',
    message: 'Your February 2026 expense report is ready to export.',
    type: 'info',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: '5',
    title: 'Budget Exceeded',
    message: 'Your Entertainment budget has been exceeded by $22.50.',
    type: 'alert',
    timestamp: '3 days ago',
    read: true,
  },
  {
    id: '6',
    title: 'New Category Added',
    message: 'Category "Transport" was added successfully.',
    type: 'success',
    timestamp: '1 week ago',
    read: true,
  },
  {
    id: '7',
    title: 'Upcoming Recurring',
    message: 'Annual Insurance ($1,200) is due in 10 days.',
    type: 'warning',
    timestamp: '1 week ago',
    read: true,
  },
];

type Props = {
  navigation?: any;
};

const NotificationsScreen: React.FC<Props> = () => {
  const [notifications, setNotifications] = useState<Notification[]>(PLACEHOLDER_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const typeStyle = TYPE_STYLES[item.type];
    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.notifCardUnread]}
        onPress={() => markRead(item.id)}
        activeOpacity={0.85}>
        {/* Unread indicator bar */}
        {!item.read && <View style={[styles.unreadBar, { backgroundColor: typeStyle.dot }]} />}

        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <View style={styles.notifTitleRow}>
              {!item.read && (
                <View style={[styles.unreadDot, { backgroundColor: typeStyle.dot }]} />
              )}
              <Text style={[styles.notifTitle, !item.read && styles.notifTitleBold]}>
                {item.title}
              </Text>
            </View>
            <View style={styles.notifMeta}>
              <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
                <Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>
                  {typeStyle.label}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.dismissBtn}
                onPress={() => dismissNotification(item.id)}>
                <Text style={styles.dismissBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.notifMessage}>{item.message}</Text>

          <Text style={styles.notifTimestamp}>{item.timestamp}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCountText}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}>
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
          onPress={() => setFilter('unread')}>
          <Text style={[styles.filterTabText, filter === 'unread' && styles.filterTabTextActive]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  unreadCountText: {
    fontSize: 13,
    color: '#4f46e5',
    fontWeight: '600',
    marginTop: 2,
  },
  markAllBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ede9fe',
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 13,
    color: '#5b21b6',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterTabActive: {
    backgroundColor: '#4f46e5',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  separator: {
    height: 8,
  },
  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notifCardUnread: {
    shadowOpacity: 0.08,
    elevation: 3,
  },
  unreadBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  notifContent: {
    flex: 1,
    padding: 14,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  notifTitleBold: {
    fontWeight: '700',
    color: '#1a1a2e',
  },
  notifMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dismissBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtnText: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '700',
  },
  notifMessage: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 19,
    marginBottom: 8,
  },
  notifTimestamp: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: '#bbb',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtext: {
    color: '#ccc',
    fontSize: 13,
  },
});

export default NotificationsScreen;
