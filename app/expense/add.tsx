import { useState } from "react";
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
import { auth, db } from "../../config/FirebaseConfig";
import { Picker } from "@react-native-picker/picker";

export default function AddExpenseScreen() {
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
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Nazad</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Dodaj trošak</Text>

      <TextInput
        style={styles.input}
        placeholder="Naziv troška"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Iznos"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Hrana" value="Hrana" />
        <Picker.Item label="Prevoz" value="Prevoz" />
        <Picker.Item label="Račun" value="Račun" />
        <Picker.Item label="Zdravlje" value="Zdravlje" />
        <Picker.Item label="Zabava" value="Zabava" />
        <Picker.Item label="Obrazovanje" value="Obrazovanje" />
        <Picker.Item label="Ostalo" value="Ostalo" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Opis"
        value={description}
        onChangeText={setDescription}
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
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
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