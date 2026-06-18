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

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
};

export default function HomeScreen() {
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
      const data: Expense[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Expense, "id">),
      }));

      setExpenses(data);
      setLoading(false);
    });

    const loadBudget = async () => {
    const profileRef = doc(
      db,
      "users",
      user.uid,
      "settings",
      "profile"
    );

    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
    setBudget(profileSnap.data().monthlyBudget || 0);
    }
  };

    loadBudget();

    return unsubscribe;
  }, []);

  const totalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const latestExpense =
    expenses.length > 0 ? expenses[expenses.length - 1] : null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const remainingBudget = budget - totalSpent;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Tracker</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ukupno potrošeno</Text>
        <Text style={styles.cardValue}>{totalSpent} RSD</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mesečni budžet</Text>
        <Text style={styles.cardValue}>{budget} RSD</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preostalo</Text>
        <Text
          style={[
            styles.cardValue,
            { color: remainingBudget >= 0 ? "green" : "red" },
          ]}
        >
          {remainingBudget} RSD
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Broj troškova</Text>
        <Text style={styles.cardValue}>{expenses.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Poslednji trošak</Text>

        {latestExpense ? (
          <>
            <Text style={styles.latestTitle}>
              {latestExpense.title}
            </Text>
            <Text>
              {latestExpense.amount} RSD
            </Text>
          </>
        ) : (
          <Text>Nema troškova</Text>
        )}
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
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    color: "#666",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
  },
  latestTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
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
});