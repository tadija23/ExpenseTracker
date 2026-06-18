import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";

import { auth, db } from "../../config/FirebaseConfig";
import { useTheme } from "../../context/ThemeContext";

export default function AddExpenseScreen() {
  const { theme } = useTheme();

  const amountInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Hrana");
  const [description, setDescription] = useState("");

  const handleAddExpense = async () => {
    if (!title || !amount || !category) {
      Alert.alert("Greška", "Popuni naziv, iznos i kategoriju.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Greška", "Korisnik nije prijavljen.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "expenses"), {
        title,
        amount: Number(amount),
        category,
        description,
        createdAt: serverTimestamp(),
        userId: user.uid,
      });

      Alert.alert("Uspeh", "Trošak je dodat.");
      router.replace("/(tabs)/expenses" as any);
    } catch (error: any) {
      Alert.alert("Greška", error.message);
    }
  };

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

      <Text style={[styles.title, { color: theme.text }]}>Dodaj trošak</Text>

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
        ref={amountInputRef}
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
        ref={descriptionInputRef}
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
        multiline
        blurOnSubmit
        returnKeyType="done"
        onSubmitEditing={handleAddExpense}
      />

      <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
        <Text style={styles.buttonText}>Sačuvaj trošak</Text>
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