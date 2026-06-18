import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { PieChart } from "react-native-chart-kit";

import { auth, db } from "../../config/FirebaseConfig";
import { useTheme } from "../../context/ThemeContext";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
};

type CategoryTotals = {
  [category: string]: number;
};

const chartColors = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#34C759",
];

export default function StatisticsScreen() {
  const { theme } = useTheme();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", user.uid, "expenses");

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const data: Expense[] = snapshot.docs.map((expenseDoc) => ({
        id: expenseDoc.id,
        ...(expenseDoc.data() as Omit<Expense, "id">),
      }));

      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  const biggestExpense = expenses.reduce<Expense | null>((max, item) => {
    if (!max || Number(item.amount) > Number(max.amount)) return item;
    return max;
  }, null);

  const categoryTotals = expenses.reduce<CategoryTotals>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );

  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

  const averageExpense =
    expenses.length > 0 ? Math.round(total / expenses.length) : 0;

  const pieData = sortedCategories.map(([category, amount], index) => ({
    name: category,
    amount,
    color: chartColors[index % chartColors.length],
    legendFontColor: theme.text,
    legendFontSize: 13,
  }));

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: theme.text }]}>Statistika</Text>

      <View
        style={[
          styles.mainCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.mainLabel, { color: theme.secondaryText }]}>
          Ukupno potrošeno
        </Text>
        <Text style={[styles.mainValue, { color: theme.text }]}>
          {total} RSD
        </Text>
      </View>

      <View style={styles.grid}>
        <View
          style={[
            styles.smallCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.smallLabel, { color: theme.secondaryText }]}>
            Broj troškova
          </Text>
          <Text style={[styles.smallValue, { color: theme.text }]}>
            {expenses.length}
          </Text>
        </View>

        <View
          style={[
            styles.smallCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.smallLabel, { color: theme.secondaryText }]}>
            Prosek
          </Text>
          <Text style={[styles.smallValue, { color: theme.text }]}>
            {averageExpense} RSD
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardLabel, { color: theme.secondaryText }]}>
          Najveći trošak
        </Text>
        <Text style={[styles.cardValue, { color: theme.text }]}>
          {biggestExpense
            ? `${biggestExpense.title} - ${biggestExpense.amount} RSD`
            : "Nema troškova"}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardLabel, { color: theme.secondaryText }]}>
          Najveća kategorija
        </Text>
        <Text style={[styles.cardValue, { color: theme.text }]}>
          {topCategory ? `${topCategory[0]} - ${topCategory[1]} RSD` : "Nema podataka"}
        </Text>
      </View>

      <Text style={[styles.subtitle, { color: theme.text }]}>Po kategorijama</Text>

      {pieData.length > 0 ? (
        <View
          style={[
            styles.chartCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <PieChart
            data={pieData}
            width={Dimensions.get("window").width - 70}
            height={210}
            chartConfig={{
              color: () => theme.text,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="10"
          />
        </View>
      ) : (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Nema statistike
          </Text>
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            Statistika se pojavljuje tek kada dodaš troškove. Matematika,
            brutalno iskrena kao i obično.
          </Text>
        </View>
      )}

      {sortedCategories.map(([category, amount], index) => {
        const percentage = total > 0 ? (amount / total) * 100 : 0;

        return (
          <View
            key={category}
            style={[
              styles.categoryCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.categoryHeader}>
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: chartColors[index % chartColors.length] },
                  ]}
                />

                <Text style={[styles.categoryName, { color: theme.text }]}>
                  {category}
                </Text>
              </View>

              <Text style={[styles.categoryAmount, { color: theme.text }]}>
                {amount} RSD
              </Text>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${percentage}%`,
                    backgroundColor: chartColors[index % chartColors.length],
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.percentageText,
                { color: theme.secondaryText },
              ]}
            >
              {percentage.toFixed(1)}% ukupne potrošnje
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  mainCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },
  mainLabel: {
    fontSize: 15,
  },
  mainValue: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 6,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  smallCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
  },
  smallLabel: {
    fontSize: 14,
  },
  smallValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 15,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 12,
  },
  chartCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    marginBottom: 14,
    alignItems: "center",
  },
  categoryCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  progressBackground: {
    height: 9,
    backgroundColor: "#D1D5DB",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
  },
  percentageText: {
    marginTop: 8,
    fontSize: 13,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 20,
  },
});