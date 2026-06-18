import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { signOut } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { router } from "expo-router";
import { auth, db } from "../../config/FirebaseConfig";

type Expense = {
  amount: number;
};

export default function ProfileScreen() {
  const [nickname, setNickname] = useState("");
  const [budget, setBudget] = useState("");
  const [savedBudget, setSavedBudget] = useState<number | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const loadProfile = async () => {
      const ref = doc(db, "users", user.uid, "settings", "profile");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setNickname(data.nickname || "");

        if (data.monthlyBudget) {
          setSavedBudget(Number(data.monthlyBudget));
          setBudget(String(data.monthlyBudget));
        }
      }
    };

    loadProfile();

    const expensesRef = collection(db, "users", user.uid, "expenses");

    const unsubscribe = onSnapshot(expensesRef, (snapshot) => {
      const expenses: Expense[] = snapshot.docs.map(
        (doc) => doc.data() as Expense
      );

      const total = expenses.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );

      setTotalSpent(total);
    });

    return unsubscribe;
  }, []);

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!nickname.trim()) {
      Alert.alert("Greška", "Unesi nickname.");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid, "settings", "profile"),
        {
          nickname,
          email: user.email,
        },
        { merge: true }
      );

      Alert.alert("Uspeh", "Profil je sačuvan.");
    } catch (error: any) {
      Alert.alert("Greška", error.message);
    }
  };

  const handleSaveBudget = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (savedBudget !== null) {
      Alert.alert("Info", "Budžet je već postavljen i zaključan.");
      return;
    }

    if (!budget || Number(budget) <= 0) {
      Alert.alert("Greška", "Unesi validan mesečni budžet.");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid, "settings", "profile"),
        {
          monthlyBudget: Number(budget),
          email: user.email,
        },
        { merge: true }
      );

      setSavedBudget(Number(budget));
      Alert.alert("Uspeh", "Budžet je sačuvan i zaključan.");
    } catch (error: any) {
      Alert.alert("Greška", error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/login" as any);
  };

  const remainingBudget =
    savedBudget !== null ? savedBudget - totalSpent : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Korisnik</Text>
        <Text style={styles.cardValue}>
          {nickname || "Nije postavljen nickname"}
        </Text>
      </View>

      <Text style={styles.label}>Nickname</Text>

      <TextInput
        style={styles.input}
        placeholder="Unesi nickname"
        value={nickname}
        onChangeText={setNickname}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <Text style={styles.buttonText}>Sačuvaj nickname</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Mesečni budžet</Text>

      <TextInput
        style={[
          styles.input,
          savedBudget !== null && styles.disabledInput,
        ]}
        placeholder="Unesi budžet u RSD"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        editable={savedBudget === null}
      />

      <TouchableOpacity
        style={[
          styles.saveButton,
          savedBudget !== null && styles.disabledButton,
        ]}
        onPress={handleSaveBudget}
        disabled={savedBudget !== null}
      >
        <Text style={styles.buttonText}>
          {savedBudget !== null ? "Budžet zaključan" : "Sačuvaj budžet"}
        </Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Mesečni budžet</Text>
        <Text style={styles.cardValue}>
          {savedBudget !== null ? `${savedBudget} RSD` : "Nije postavljen"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Potrošeno</Text>
        <Text style={styles.cardValue}>{totalSpent} RSD</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Preostalo</Text>
        <Text
          style={[
            styles.cardValue,
            { color: remainingBudget >= 0 ? "green" : "red" },
          ]}
        >
          {savedBudget !== null ? `${remainingBudget} RSD` : "Nema budžeta"}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Odjavi se</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 70,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  disabledInput: {
    backgroundColor: "#eee",
    color: "#777",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: "#999",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 15,
    color: "#666",
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
});