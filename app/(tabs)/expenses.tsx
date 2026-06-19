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
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setExpenses, setExpensesLoading } from "../../store/expensesSlice";
import { auth, db } from "../../config/FirebaseConfig";
import { useTheme } from "../../context/ThemeContext";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Hrana":
      return "🍔";
    case "Prevoz":
      return "🚗";
    case "Računi":
      return "🧾";
    case "Zabava":
      return "🎮";
    case "Zdravlje":
      return "💊";
    default:
      return "📌";
  }
};

export default function ExpensesScreen() {
  const { theme } = useTheme();

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("newest");
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const loading = useAppSelector((state) => state.expenses.loading);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      dispatch(setExpensesLoading(false));
      return;
    }

    const expensesRef = collection(db, "users", user.uid, "expenses");
    const q = query(expensesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Expense[] = snapshot.docs.map((expenseDoc) => {
        const expenseData = expenseDoc.data();

        return {
          id: expenseDoc.id,
          title: expenseData.title || "",
          amount: Number(expenseData.amount || 0),
          category: expenseData.category || "",
          description: expenseData.description || "",
        };
      });

      dispatch(setExpenses(data));
    });

    return unsubscribe;
  }, []);

  const totalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const filteredExpenses = expenses
    .filter(
      (expense) =>
        expense.title.toLowerCase().includes(search.toLowerCase()) ||
        expense.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortType === "highest") return b.amount - a.amount;
      if (sortType === "lowest") return a.amount - b.amount;
      if (sortType === "titleAsc") return a.title.localeCompare(b.title);
      if (sortType === "titleDesc") return b.title.localeCompare(a.title);
      return 0;
    });

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Troškovi</Text>

      <View
        style={[
          styles.summaryCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View>
          <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
            Ukupno potrošeno
          </Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {totalSpent} RSD
          </Text>
        </View>

        <View style={styles.summaryRight}>
          <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
            Broj troškova
          </Text>
          <Text style={[styles.summaryValueSmall, { color: theme.text }]}>
            {expenses.length}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/expense/add" as any)}
      >
        <Text style={styles.addButtonText}>+ Dodaj trošak</Text>
      </TouchableOpacity>

      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        placeholder="Pretraži po nazivu ili kategoriji"
        placeholderTextColor={theme.secondaryText}
        value={search}
        onChangeText={setSearch}
      />

      <View
        style={[
          styles.pickerWrapper,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Picker
          selectedValue={sortType}
          onValueChange={(value) => setSortType(value)}
          style={[styles.picker, { color: theme.text }]}
          dropdownIconColor={theme.text}
        >
          <Picker.Item label="Najnovije dodato" value="newest" />
          <Picker.Item label="Najveći iznos" value="highest" />
          <Picker.Item label="Najmanji iznos" value="lowest" />
          <Picker.Item label="Naziv A-Z" value="titleAsc" />
          <Picker.Item label="Naziv Z-A" value="titleDesc" />
        </Picker>
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Nema troškova
            </Text>
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              Dodaj prvi trošak i aplikacija će imati šta da broji. Šokantno,
              znam.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() =>
              router.push({
                pathname: "/expense/details" as any,
                params: { id: item.id },
              })
            }
          >
            <View style={styles.cardTop}>
              <View style={styles.cardLeft}>
                <Text style={styles.categoryIcon}>
                  {getCategoryIcon(item.category)}
                </Text>

                <View style={styles.cardTextWrapper}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardCategory,
                      { color: theme.secondaryText },
                    ]}
                  >
                    {item.category}
                  </Text>
                </View>
              </View>

              <Text style={[styles.amount, { color: theme.text }]}>
                {item.amount} RSD
              </Text>
            </View>

            {item.description ? (
              <Text
                numberOfLines={2}
                style={[styles.description, { color: theme.secondaryText }]}
              >
                {item.description}
              </Text>
            ) : null}
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
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  summaryRight: {
    alignItems: "flex-end",
  },
  summaryValueSmall: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  addButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 14,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  listContent: {
    paddingBottom: 30,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },
  cardCategory: {
    fontSize: 14,
    marginTop: 3,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
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