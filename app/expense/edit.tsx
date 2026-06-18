import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

import { auth, db } from "../../config/FirebaseConfig";
import { useTheme } from "../../context/ThemeContext";

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const amountInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Hrana");
  const [description, setDescription] = useState("");
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
        const data = snap.data();

        setTitle(data.title || "");
        setAmount(String(data.amount || ""));
        setCategory(data.category || "Hrana");
        setDescription(data.description || "");
      }

      setLoading(false);
    };

    loadExpense();
  }, [id]);

  const handleUpdateExpense = async () => {
    const user = auth.currentUser;

    if (!user || !id) return;

    if (!title || !amount || !category) {
      Alert.alert("Greška", "Popuni naziv, iznos i kategoriju.");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid, "expenses", String(id)), {
        title,
        amount: Number(amount),
        category,
        description,
      });

      router.back();

      Alert.alert("Uspeh", "Trošak je izmenjen.");
      router.replace({
        pathname: "/expense/details" as any,
        params: { id: String(id) },
      });
    } catch (error: any) {
      Alert.alert("Greška", error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
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
        <Text style={[styles.backText, { color: theme.primary }]}>
          ← Nazad
        </Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>Izmeni trošak</Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        placeholder="Naziv troška"
        placeholderTextColor={theme.secondaryText}
        value={title}
        onChangeText={setTitle}
        returnKeyType="next"
        onSubmitEditing={() => amountInputRef.current?.focus()}
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        placeholder="Iznos"
        placeholderTextColor={theme.secondaryText}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        ref={amountInputRef}
        returnKeyType="next"
        onSubmitEditing={() => descriptionInputRef.current?.focus()}
      />

      <View
        style={[
          styles.pickerWrapper,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={[styles.picker, { color: theme.text }]}
          dropdownIconColor={theme.text}
        >
          <Picker.Item label="Hrana" value="Hrana" />
          <Picker.Item label="Prevoz" value="Prevoz" />
          <Picker.Item label="Računi" value="Računi" />
          <Picker.Item label="Zabava" value="Zabava" />
          <Picker.Item label="Ostalo" value="Ostalo" />
        </Picker>
      </View>

      <TextInput
        style={[
          styles.input,
          styles.descriptionInput,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        placeholder="Opis"
        placeholderTextColor={theme.secondaryText}
        value={description}
        onChangeText={setDescription}
        ref={descriptionInputRef}
        multiline={false}
        returnKeyType="done"
        onSubmitEditing={handleUpdateExpense}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdateExpense}>
        <Text style={styles.buttonText}>Sačuvaj izmene</Text>
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
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  backText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  descriptionInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});