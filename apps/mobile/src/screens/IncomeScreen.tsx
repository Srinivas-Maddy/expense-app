import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type Income = {
  id: string;
  title: string;
  source: string;
  amount: number;
  date: string;
};

const PLACEHOLDER_INCOMES: Income[] = [
  { id: '1', title: 'Monthly Salary', source: 'Employment', amount: 4500.0, date: 'Mar 1' },
  { id: '2', title: 'Freelance Project', source: 'Freelance', amount: 600.0, date: 'Mar 8' },
  { id: '3', title: 'Dividend', source: 'Investments', amount: 100.0, date: 'Mar 15' },
];

type Props = {
  navigation?: any;
};

const IncomeItem: React.FC<{ item: Income }> = ({ item }) => (
  <View style={styles.item}>
    <View style={styles.itemLeft}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemSource}>{item.source}</Text>
    </View>
    <View style={styles.itemRight}>
      <Text style={styles.itemAmount}>+${item.amount.toFixed(2)}</Text>
      <Text style={styles.itemDate}>{item.date}</Text>
    </View>
  </View>
);

const IncomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleAddIncome = () => {
    // TODO: navigate to add income screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Income</Text>
          <Text style={styles.total}>
            Total: $
            {PLACEHOLDER_INCOMES.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddIncome}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={PLACEHOLDER_INCOMES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IncomeItem item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No income entries yet</Text>
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
  total: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#10b981',
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
  itemSource: {
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
    color: '#10b981',
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
});

export default IncomeScreen;
