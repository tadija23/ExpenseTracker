import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../config/FirebaseConfig";
import { useTheme } from "../../context/ThemeContext";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
};

export default function HomeScreen() {
  const { theme } = useTheme();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const expensesRef = collection(db, "users", user.uid, "expenses");

    const unsubscribe = onSnapshot(expensesRef, (snapshot) => {
      const data: Expense[] = snapshot.docs.map((expenseDoc) => ({
        id: expenseDoc.id,
        ...(expenseDoc.data() as Omit<Expense, "id">),
      }));

      setExpenses(data);
      setLoading(false);
    });

    const profileRef = doc(db, "users", user.uid, "settings", "profile");

    const unsubscribeBudget = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        setBudget(Number(snapshot.data().monthlyBudget || 0));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeBudget();
    };
  }, []);

  const totalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const remainingBudget = budget - totalSpent;

  const isBudgetExceeded = budget > 0 && totalSpent > budget;
  const exceededAmount = totalSpent - budget;

  const percentageUsed =
    budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  const progressColor =
    percentageUsed >= 90
      ? "#FF3B30"
      : percentageUsed >= 70
      ? "#FF9500"
      : "#34C759";

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Home</Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.secondaryText }]}>
          Mesečni budžet
        </Text>
        <Text style={[styles.cardValue, { color: theme.text }]}>
          {budget > 0 ? `${budget} RSD` : "Nije postavljen"}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.secondaryText }]}>
          Ukupno potrošeno
        </Text>
        <Text style={[styles.cardValue, { color: theme.text }]}>
          {totalSpent} RSD
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.secondaryText }]}>
          Preostalo
        </Text>
        <Text
          style={[
            styles.cardValue,
            { color: remainingBudget >= 0 ? "#34C759" : "#FF3B30" },
          ]}
        >
          {budget > 0 ? `${remainingBudget} RSD` : "Nema budžeta"}
        </Text>
      </View>

      {isBudgetExceeded && (
        <View
          style={[
            styles.warningCard,
            {
              backgroundColor: theme.card,
              borderColor: "#FF3B30",
            },
          ]}
        >
          <Text style={styles.warningTitle}>⚠ Budžet je prekoračen</Text>
          <Text style={styles.warningText}>
            Prekoračio si mesečni budžet za {exceededAmount} RSD.
          </Text>
        </View>
      )}

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.secondaryText }]}>
          Iskorišćenost budžeta
        </Text>

        <Text
          style={[
            styles.cardValue,
            {
              color: theme.text,
              marginBottom: 15,
            },
          ]}
        >
          {budget > 0 ? `${percentageUsed.toFixed(1)}%` : "0%"}
        </Text>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentageUsed}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/expense/add" as any)}
      >
        <Text style={styles.buttonText}>Dodaj trošak</Text>
      </TouchableOpacity>
    </View>
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
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
  },
  progressBackground: {
    height: 20,
    backgroundColor: "#D1D5DB",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  warningCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
},
warningTitle: {
  color: "#FF3B30",
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 6,
},
warningText: {
  color: "#FF3B30",
  fontSize: 15,
},
});