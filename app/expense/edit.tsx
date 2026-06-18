import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../config/FirebaseConfig";
import { Picker } from "@react-native-picker/picker";

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const loadExpense = async () => {
      const user = auth.currentUser;
      if (!user || !id) return;

      const ref = doc(db, "users", user.uid, "expenses", String(id));
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title || "");
        setAmount(String(data.amount || ""));
        setCategory(data.category || "");
        setDescription(data.description || "");
      }
    };

    loadExpense();
  }, [id]);

  const handleUpdate = async () => {
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

      Alert.alert("Uspeh", "Trošak je izmenjen.");
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

      <Text style={styles.title}>Izmeni trošak</Text>

      <TextInput style={styles.input} placeholder="Naziv" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Iznos" value={amount} onChangeText={setAmount} keyboardType="numeric" />

      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Hrana" value="Hrana" />
        <Picker.Item label="Prevoz" value="Prevoz" />
        <Picker.Item label="Računi" value="Računi" />
        <Picker.Item label="Zabava" value="Zabava" />
        <Picker.Item label="Zdravlje" value="Zdravlje" />
        <Picker.Item label="Obrazovanje" value="Obrazovanje" />
        <Picker.Item label="Ostalo" value="Ostalo" />
      </Picker>

      <TextInput style={styles.input} placeholder="Opis" value={description} onChangeText={setDescription} />


      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Sačuvaj izmene</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 30 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 15 },
  button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 10 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
  picker: {borderWidth: 1, borderColor: "#ccc", marginBottom: 15},
  backButton: {alignSelf: "flex-start", backgroundColor: "#f0f0f0", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,marginBottom: 20},
  backText: {fontSize: 18, fontWeight: "bold", color: "#007AFF"},
});