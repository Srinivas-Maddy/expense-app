import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
};

const PLACEHOLDER_EXPENSES: Expense[] = [
  { id: '1', title: 'Grocery Shopping', category: 'Food', amount: 85.5, date: 'Mar 18' },
  { id: '2', title: 'Electric Bill', category: 'Utilities', amount: 120.0, date: 'Mar 15' },
  { id: '3', title: 'Netflix', category: 'Entertainment', amount: 15.99, date: 'Mar 12' },
  { id: '4', title: 'Gym Membership', category: 'Health', amount: 40.0, date: 'Mar 10' },
];

type Props = {
  navigation?: any;
};

const ExpenseItem: React.FC<{ item: Expense }> = ({ item }) => (
  <View style={styles.item}>
    <View style={styles.itemLeft}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemCategory}>{item.category}</Text>
    </View>
    <View style={styles.itemRight}>
      <Text style={styles.itemAmount}>-${item.amount.toFixed(2)}</Text>
      <Text style={styles.itemDate}>{item.date}</Text>
    </View>
  </View>
);

const ExpensesScreen: React.FC<Props> = ({ navigation }) => {
  const handleAddExpense = () => {
    // TODO: navigate to add expense screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Expenses</Text>
        <Text style={styles.total}>
          Total: $
          {PLACEHOLDER_EXPENSES.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
        </Text>
      </View>

      <FlatList
        data={PLACEHOLDER_EXPENSES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExpenseItem item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No expenses yet</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  total: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemLeft: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  itemCategory: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
  itemDate: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  separator: {
    height: 4,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#bbb',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
  },
});

export default ExpensesScreen;
