import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { deleteDoc, doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../config/FirebaseConfig";
import { useTheme } from "../../context/ThemeContext";

type Expense = {
  title: string;
  amount: number;
  category: string;
  description?: string;
};

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpense = async () => {
      const user = auth.currentUser;

      if (!user || !id) {
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", user.uid, "expenses", String(id));
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setExpense(snap.data() as Expense);
      }

      setLoading(false);
    };

    loadExpense();
  }, [id]);

  const handleDelete = async () => {
    const user = auth.currentUser;

    if (!user || !id) return;

    Alert.alert("Brisanje troška", "Da li si siguran da želiš da obrišeš ovaj trošak?", [
      {
        text: "Otkaži",
        style: "cancel",
      },
      {
        text: "Obriši",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "users", user.uid, "expenses", String(id)));
          router.replace("/(tabs)/expenses" as any);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!expense) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Trošak nije pronađen.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={[
          styles.backButton,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.backText, { color: theme.primary }]}>← Nazad</Text>
      </TouchableOpacity>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          {expense.title}
        </Text>

        <Text style={[styles.info, { color: theme.text }]}>
          Kategorija: {expense.category}
        </Text>

        <Text style={[styles.info, { color: theme.text }]}>
          Iznos: {expense.amount} RSD
        </Text>

        <Text style={[styles.info, { color: theme.text }]}>
          Opis: {expense.description || "Nema opisa"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: "/expense/edit" as any,
            params: { id: String(id) },
          })
        }
      >
        <Text style={styles.buttonText}>Izmeni</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.buttonText}>Obriši</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 25,
  },
  backText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 22,
  },
  info: {
    fontSize: 18,
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});