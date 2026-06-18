import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { auth, db } from "../../config/FirebaseConfig";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
};

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("newest");

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const expensesRef = collection(db, "users", user.uid, "expenses");
    const q = query(expensesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Expense[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Expense, "id">),
      }));

      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const filteredExpenses = expenses
  .filter((expense) => 
    expense.title.toLowerCase().includes(search.toLowerCase()) ||
    expense.category.toLowerCase().includes(search.toLowerCase())
  )

  .sort((a, b) => {
    if (sortType ==="highest") return b.amount - a.amount;
    if (sortType ==="lowest") return a.amount - b.amount;
    if (sortType === "titleAsc") return a.title.localeCompare(b.title);
    if (sortType === "titleDesc") return b.title.localeCompare(a.title);
    return 0; // Default case for "newest" or any other unspecified sort type
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Troškovi</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/expense/add" as any)}
      >
        <Text style={styles.addButtonText}>Dodaj trošak</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.searchInput}
        placeholder="Pretraži po nazivu ili kategoriji"
        value={search}
        onChangeText={setSearch}
      />  

      <Text style={styles.sortLabel}>Sortiraj po:</Text>

      <Picker
        selectedValue={sortType}
        onValueChange={(value) => setSortType(value)}
        style={styles.picker}
      >
        <Picker.Item label="Najnovije" value="newest" />
        <Picker.Item label="Najstarije" value="oldest" />
        <Picker.Item label="Najskuplje" value="highest" />
        <Picker.Item label="Najjeftinije" value="lowest" />
        <Picker.Item label="Naziv A-Z" value="titleAsc" />
        <Picker.Item label="Naziv Z-A" value="titleDesc" />
      </Picker>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>Nema dodatih troškova.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/expense/details" as any,
                params: { id: item.id },
              })
            }
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text>Kategorija: {item.category}</Text>
            <Text>Iznos: {item.amount} RSD</Text>
            {item.description ? <Text>Opis: {item.description}</Text> : null}
          </TouchableOpacity>
        )}
      />
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
  }
});