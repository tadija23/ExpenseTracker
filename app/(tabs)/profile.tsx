import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import {
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { router } from "expo-router";

import { auth, db } from "../../config/FirebaseConfig";
import { useTheme } from "../../context/ThemeContext";

type Expense = {
  amount: number;
};

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();

  const [nickname, setNickname] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);

  const [budget, setBudget] = useState("");
  const [savedBudget, setSavedBudget] = useState<number | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const [showBudgetPassword, setShowBudgetPassword] = useState(false);
  const [password, setPassword] = useState("");

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
        setIsEditingNickname(!data.nickname);

        if (data.monthlyBudget) {
          setSavedBudget(Number(data.monthlyBudget));
          setBudget(String(data.monthlyBudget));
          setIsEditingBudget(false);
        } else {
          setIsEditingBudget(true);
        }
      } else {
        setIsEditingNickname(true);
        setIsEditingBudget(true);
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

      setIsEditingNickname(false);
      Alert.alert("Uspeh", "Nickname je sačuvan.");
    } catch (error: any) {
      Alert.alert("Greška", error.message);
    }
  };

  const handleBudgetEditPress = () => {
    if (savedBudget === null) {
      setIsEditingBudget(true);
      return;
    }

    setShowBudgetPassword(true);
  };

  const handleReauthenticateBudget = async () => {
    const user = auth.currentUser;

    if (!user || !user.email) {
      Alert.alert("Greška", "Korisnik nije pronađen.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Greška", "Unesi lozinku.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password);

      await reauthenticateWithCredential(user, credential);

      setPassword("");
      setShowBudgetPassword(false);
      setIsEditingBudget(true);

      Alert.alert("Uspeh", "Sada možeš da izmeniš budžet.");
    } catch (error: any) {
      Alert.alert("Greška", "Pogrešna lozinka ili re-autentifikacija nije uspela.");
    }
  };

  const handleSaveBudget = async () => {
    const user = auth.currentUser;
    if (!user) return;

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
      setIsEditingBudget(false);
      Alert.alert("Uspeh", "Budžet je sačuvan.");
    } catch (error: any) {
      Alert.alert("Greška", error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/login" as any);
  };

  const remainingBudget = savedBudget !== null ? savedBudget - totalSpent : 0;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>Profil</Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.themeRow}>
          <View>
            <Text style={[styles.cardLabel, { color: theme.secondaryText }]}>
              Tema aplikacije
            </Text>
            <Text style={[styles.cardValue, { color: theme.text }]}>
              {isDark ? "Dark mode" : "Light mode"}
            </Text>
          </View>

          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {nickname ? nickname.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>

          <View>
            <Text style={[styles.cardLabel, {color: theme.secondaryText }]}>
              Korisnik
            </Text>

            <Text style={[styles.cardValue, {color: theme.text}]}>
              {nickname || "Nije postavljen nickname"}
            </Text>
          </View>
        </View>

          {nickname ? (
            <TouchableOpacity
              style={styles.editSmallButton}
              onPress={() => setIsEditingNickname(true)}
            >
              <Text style={styles.editSmallButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>

      {isEditingNickname && (
        <>
          <Text style={[styles.label, { color: theme.text }]}>Nickname</Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Unesi nickname"
            placeholderTextColor={theme.secondaryText}
            value={nickname}
            onChangeText={setNickname}
            returnKeyType="done"
            onSubmitEditing={handleSaveProfile}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.buttonText}>Sačuvaj nickname</Text>
          </TouchableOpacity>
        </>
      )}

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardLabel, { color: theme.secondaryText }]}>
              Budžet
            </Text>
            <Text style={[styles.cardValue, { color: theme.text }]}>
              {savedBudget !== null ? `${savedBudget} RSD` : "Nije postavljen"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editSmallButton}
            onPress={handleBudgetEditPress}
          >
            <Text style={styles.editSmallButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.budgetDetails}>
          <View style={styles.budgetRow}>
            <Text style={[styles.budgetLabel, { color: theme.secondaryText }]}>
              Potrošeno
            </Text>
            <Text style={[styles.budgetValue, { color: theme.text }]}>
              {totalSpent} RSD
            </Text>
          </View>

          <View style={styles.budgetRow}>
            <Text style={[styles.budgetLabel, { color: theme.secondaryText }]}>
              Preostalo
            </Text>
            <Text
              style={[
                styles.budgetValue,
                { color: remainingBudget >= 0 ? "#34C759" : "#FF3B30" },
              ]}
            >
              {savedBudget !== null ? `${remainingBudget} RSD` : "Nema budžeta"}
            </Text>
          </View>
        </View>
      </View>

      {showBudgetPassword && (
        <>
          <Text style={[styles.label, { color: theme.text }]}>
            Potvrdi lozinku za izmenu budžeta
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Unesi lozinku"
            placeholderTextColor={theme.secondaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleReauthenticateBudget}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleReauthenticateBudget}
          >
            <Text style={styles.buttonText}>Potvrdi</Text>
          </TouchableOpacity>
        </>
      )}

      {isEditingBudget && (
        <>
          <Text style={[styles.label, { color: theme.text }]}>
            Mesečni budžet
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Unesi mesečni budžet"
            placeholderTextColor={theme.secondaryText}
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleSaveBudget}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveBudget}>
            <Text style={styles.buttonText}>Sačuvaj budžet</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Odjavi se</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLabel: {
    fontSize: 15,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editSmallButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  editSmallButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  budgetDetails: {
    marginTop: 16,
    gap: 12,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  budgetLabel: {
    fontSize: 15,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfo: {
  flexDirection: "row",
  alignItems: "center",
},
avatar: {
  width: 55,
  height: 55,
  borderRadius: 27.5,
  backgroundColor: "#007AFF",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
},
avatarText: {
  color: "white",
  fontSize: 24,
  fontWeight: "bold",
},
});