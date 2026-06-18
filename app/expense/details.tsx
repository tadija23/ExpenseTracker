import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/FirebaseConfig";

type Expense = {
  title: string;
  amount: number;
  category: string;
  description?: string;
};

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [expense, setExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const loadExpense = async () => {
      const user = auth.currentUser;
      if (!user || !id) return;

      const ref = doc(db, "users", user.uid, "expenses", String(id));
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setExpense(snap.data() as Expense);
      }
    };

    loadExpense();
  }, [id]);

  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!user || !id) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "expenses", String(id)));
      Alert.alert("Uspeh", "Trošak je obrisan.");
      router.replace("/(tabs)/expenses" as any);
    } catch (error: any) {
      Alert.alert("Greška", error.message);
    }
  };

  if (!expense) {
    return (
      <View style={styles.container}>
        <Text>Učitavanje...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Nazad</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{expense.title}</Text>
      <Text style={styles.text}>Kategorija: {expense.category}</Text>
      <Text style={styles.text}>Iznos: {expense.amount} RSD</Text>
      <Text style={styles.text}>Opis: {expense.description || "Nema opisa"}</Text>

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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
    backText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
});