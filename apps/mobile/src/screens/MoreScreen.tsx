import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

type MenuItem = {
  label: string;
  description: string;
  icon: string;
  screen: string;
  color: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Budgets',
    description: 'Set and track spending budgets',
    icon: '🎯',
    screen: 'Budgets',
    color: '#4f46e5',
  },
  {
    label: 'Trends',
    description: 'Monthly income vs expense charts',
    icon: '📈',
    screen: 'Trends',
    color: '#0891b2',
  },
  {
    label: 'Recurring',
    description: 'Manage recurring expenses',
    icon: '🔄',
    screen: 'Recurring',
    color: '#7c3aed',
  },
  {
    label: 'Accounts',
    description: 'Bank accounts and balances',
    icon: '🏦',
    screen: 'Accounts',
    color: '#059669',
  },
  {
    label: 'Categories',
    description: 'Organize expense categories',
    icon: '🏷️',
    screen: 'Categories',
    color: '#d97706',
  },
  {
    label: 'Notifications',
    description: 'Alerts and reminders',
    icon: '🔔',
    screen: 'Notifications',
    color: '#dc2626',
  },
  {
    label: 'Export',
    description: 'Download reports as CSV or PDF',
    icon: '📥',
    screen: 'Export',
    color: '#0f766e',
  },
];

type Props = {
  navigation?: any;
};

const MoreScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>More</Text>
      <Text style={styles.subheading}>Tools & Settings</Text>

      <View style={styles.grid}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuCard}
            onPress={() => navigation?.navigate(item.screen)}
            activeOpacity={0.75}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '18' }]}>
              <Text style={styles.iconEmoji}>{item.icon}</Text>
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuDesc}>{item.description}</Text>
            <Text style={[styles.arrow, { color: item.color }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  subheading: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
    marginBottom: 24,
  },
  grid: {
    gap: 10,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconEmoji: {
    fontSize: 24,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 12,
    color: '#888',
    flex: 1,
  },
  arrow: {
    fontSize: 22,
    fontWeight: '300',
    marginLeft: 8,
  },
});

export default MoreScreen;
