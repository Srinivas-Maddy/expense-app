import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type Category = {
  id: string;
  name: string;
  type: 'expense' | 'income';
  color: string;
  itemCount: number;
};

const PLACEHOLDER_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', type: 'expense', color: '#f97316', itemCount: 12 },
  { id: '2', name: 'Utilities', type: 'expense', color: '#3b82f6', itemCount: 5 },
  { id: '3', name: 'Entertainment', type: 'expense', color: '#8b5cf6', itemCount: 7 },
  { id: '4', name: 'Health', type: 'expense', color: '#ec4899', itemCount: 3 },
  { id: '5', name: 'Transport', type: 'expense', color: '#14b8a6', itemCount: 9 },
  { id: '6', name: 'Employment', type: 'income', color: '#10b981', itemCount: 1 },
  { id: '7', name: 'Freelance', type: 'income', color: '#22c55e', itemCount: 4 },
  { id: '8', name: 'Investments', type: 'income', color: '#84cc16', itemCount: 2 },
];

type Props = {
  navigation?: any;
};

const CategoryItem: React.FC<{ item: Category }> = ({ item }) => (
  <TouchableOpacity style={styles.item}>
    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
    <View style={styles.itemInfo}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemCount}>{item.itemCount} entries</Text>
    </View>
    <View style={[styles.badge, item.type === 'income' ? styles.badgeIncome : styles.badgeExpense]}>
      <Text style={[styles.badgeText, item.type === 'income' ? styles.badgeTextIncome : styles.badgeTextExpense]}>
        {item.type}
      </Text>
    </View>
  </TouchableOpacity>
);

const CategoriesScreen: React.FC<Props> = () => {
  const handleAddCategory = () => {
    // TODO: navigate to add category screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Categories</Text>
          <Text style={styles.subheading}>{PLACEHOLDER_CATEGORIES.length} categories</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={PLACEHOLDER_CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CategoryItem item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No categories yet</Text>
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
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  subheading: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  item: {
    flexDirection: 'row',
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
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  itemCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeExpense: {
    backgroundColor: '#fef2f2',
  },
  badgeIncome: {
    backgroundColor: '#ecfdf5',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  badgeTextExpense: {
    color: '#991b1b',
  },
  badgeTextIncome: {
    color: '#065f46',
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
});

export default CategoriesScreen;
