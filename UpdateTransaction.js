import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Modal,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addCategory, editTransaction } from "./transactionsSlice";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";

const UpdateTransaction = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const navigation = useNavigation();
  const categories = useSelector((state) => state.transactions.category);
  const [description, setDescription] = useState(route.params?.description);
  const [amount, setAmount] = useState((route.params?.amount).toString());
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(route.params.type);
  const [items, setItems] = useState([
    { label: "Income", value: "Income" },
    { label: "Expense", value: "Expense" },
  ]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(
    route.params.category
  );

  const [errors, setErrors] = useState({
    description: "",
    amount: "",
    type: "",
    category: "",
  });

  const handleSubmit = () => {
    let valid = true;
    let newErrors = { description: "", amount: "", type: "", category: "" };
    if (description.trim() === "") {
      newErrors.description = "Description is required.";
      valid = false;
    }
    if (amount.trim() === "") {
      newErrors.amount = "Amount is required.";
      valid = false;
    } else if (isNaN(amount)) {
      newErrors.amount = "Amount must be a valid number.";
      valid = false;
    }
    if (!value) {
      newErrors.type = "Transaction type is required.";
      valid = false;
    }
    if (value === "Expense" && !selectedCategory) {
      newErrors.category = "Category is required for Expense.";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      const transaction = {
        id: route.params.id,
        description: description,
        amount: parseFloat(amount),
        type: value,
        date: route.params.date,
        category: value === "Expense" ? selectedCategory : null,
      };
      dispatch(editTransaction(transaction));
      navigation.goBack();
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      dispatch(addCategory(newCategory));
      setNewCategory("");
      setModalVisible(false);
    } else {
      setCategoryError("Category name is required.");
    }
  };

  return (
    <View style={styles.container}>
      <Text>Description</Text>
      <TextInput
        style={[styles.input, errors.description && styles.inputError]}
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          setErrors((prev) => ({ ...prev, description: "" }));
        }}
      />
      {errors.description ? (
        <Text style={styles.errorText}>{errors.description}</Text>
      ) : null}

      <Text>Amount</Text>
      <TextInput
        style={[styles.input, errors.amount && styles.inputError]}
        value={amount}
        keyboardType="numeric"
        onChangeText={(text) => {
          setAmount(text);
          setErrors((prev) => ({ ...prev, amount: "" }));
        }}
      />
      {errors.amount ? (
        <Text style={styles.errorText}>{errors.amount}</Text>
      ) : null}

      <Text>Transaction Type</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        style={[styles.input, errors.type && styles.inputError]}
      />
      {errors.type ? <Text style={styles.errorText}>{errors.type}</Text> : null}

      {value === "Expense" && (
        <View>
          <Text style={styles.label}>Expense Category</Text>
          <View style={styles.dropdownContainer}>
            <View style={styles.dropview}>
              <Picker
                selectedValue={selectedCategory}
                style={styles.picker}
                itemStyle={{ color: "red", fontSize: 17 }}
                onValueChange={(itemValue, itemIndex) => {
                  if (itemIndex === 0) {
                    setSelectedCategory(null);
                  } else {
                    setSelectedCategory(itemValue);
                  }
                }}
                defaultValue={selectedCategory}
              >
                <Picker.Item label="Choose Category" value={null} />
                {categories.map((category) => (
                  <Picker.Item label={category} value={category} />
                ))}
              </Picker>{" "}
            </View>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setModalVisible(true)}
            >
              <Icon name="add" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          {errors.category ? (
            <Text style={styles.errorText}>{errors.category}</Text>
          ) : null}
        </View>
      )}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false), setCategoryError(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TextInput
              style={styles.textInput}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="Enter category name"
            />
            {categoryError ? (
              <Text style={styles.errorText}>{categoryError}</Text>
            ) : null}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.customButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.customButton, styles.addButton]}
                onPress={handleAddCategory}
              >
                <Text style={styles.buttonText}>Add Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.submitButton}>
        <Button title={"Edit Transaction"} onPress={handleSubmit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f7f7f7",
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#7ba1ed",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  inputError: {
    borderColor: "#fa525b",
  },
  errorText: {
    color: "#fa525b",
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "500",
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#7ba1ed",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropview: {
    width: "90%",
  },
  inputCategory: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#7ba1ed",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
    marginRight: 10,
  },
  iconButton: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  textInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  customButton: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  addButton: {
    backgroundColor: "#4caf50",
    fontSize: 14,
    height: "40px",
  },
  cancelButton: {
    height: "40px",
    backgroundColor: "#fa525b",
    fontSize: 14,
  },
  picker: {
    marginTop: 3,
    height: 46,
    width: 200,
  },
});

export default UpdateTransaction;
