import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../config/FirebaseConfig";
import { PieChart } from "react-native-chart-kit";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
};

export default function StatisticsScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = collection(db, "users", user.uid, "expenses");

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const data: Expense[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Expense, "id">),
      }));

      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  const biggestExpense = expenses.reduce<Expense | null>((max, item) => {
    if (!max || item.amount > max.amount) return item;
    return max;
  }, null);

  const categoryTotals = expenses.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(
    ([category, amount], index) => ({
      name: category,
      amount,
      color: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
        "#8BC34A",
      ][index % 7],
      legendFontColor: "#333",
      legendFontSize: 14,
    })
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Statistika</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Ukupno potrošeno</Text>
        <Text style={styles.value}>{total} RSD</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Broj troškova</Text>
        <Text style={styles.value}>{expenses.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Najveći trošak</Text>
        <Text style={styles.value}>
          {biggestExpense ? `${biggestExpense.title} - ${biggestExpense.amount} RSD` : "Nema troškova"}
        </Text>
      </View>

      <Text style={styles.subtitle}>Po kategorijama</Text>

      {pieData.length > 0 && (
        <PieChart
          data={pieData}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            color: () => "#000",
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      )}

      {Object.entries(categoryTotals).map(([category, amount]) => (
        <View key={category} style={styles.categoryRow}>
          <Text style={styles.category}>{category}</Text>
          <Text style={styles.categoryAmount}>{amount} RSD</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  categoryRow: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  category: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});