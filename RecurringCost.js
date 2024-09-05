import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button";
import {
  addRecurringTransaction,
  deleteRecurringTransaction,
  editRecurringTransaction,
} from "./transactionsSlice";
import moment from "moment";

const RecurringCost = () => {
  const dispatch = useDispatch();
  const costList = useSelector(
    (state) => state.transactions.recurringTransactions
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [costName, setCostName] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState(null);
  const [isedit, setEdit] = useState(false);
  const [update, setUpdate] = useState(null);
  const [errors, setErrors] = useState({
    costName: "",
    amount: "",
    duration: "",
  });

  const handleOpen = () => {
    setModalVisible(true);
    setCostName("");
    setAmount("");
    setDuration(null);
    setErrors({ costName: "", amount: "", duration: "" });
  };
  const handleClose = () => {
    setModalVisible(false);
    setCostName("");
    setAmount("");
    setDuration(null);
    setUpdate(null);
    setEdit(false);
    setErrors({ costName: "", amount: "", duration: "" });
  };

  const handleUpdate = (item) => {
    setModalVisible(true);
    setErrors({ costName: "", amount: "", duration: "" });
    setUpdate(item);
    setCostName(item.const_name);
    setAmount(item.amount);
    setDuration(item.duration);
    setEdit(true);
  };

  const handleDelete = (id) => {
    dispatch(deleteRecurringTransaction(id));
  };

  const handleAddCost = () => {
    let valid = true;
    let newErrors = { costName: "", amount: "", duration: "" };
    if (costName.trim() === "") {
      newErrors.costName = "Cost Name is required.";
      valid = false;
    }
    if (amount.trim() === "") {
      newErrors.amount = "Amount is required.";
      valid = false;
    } else if (isNaN(amount)) {
      newErrors.amount = "Amount must be a valid number.";
      valid = false;
    }
    if (duration === null) {
      newErrors.duration = "Duration is required.";
      valid = false;
    }

    setErrors(newErrors);
    if (valid) {
      const getNextDate = () => {
        switch (duration) {
          case "Daily":
            return moment().add(1, "days").format("DD-MM-YYYY");
          case "Monthly":
            return moment()
              .endOf("month")
              .add(1, "months")
              .format("DD-MM-YYYY");
          case "Yearly":
            return moment()
              .endOf("year")
              .add(1, "years")
              .month(11)
              .date(31)
              .format("DD-MM-YYYY");
          default:
            return null;
        }
      };

      const newCost = {
        const_name: costName,
        amount: amount,
        duration: duration,
        id: isedit ? update.id : Date.now().toString(),
        next: isedit
          ? duration !== update.duration
            ? getNextDate()
            : update.nextdate
          : getNextDate(),
      };
      setModalVisible(false);
      if (isedit) {
        dispatch(editRecurringTransaction(newCost));
      } else {
        dispatch(addRecurringTransaction(newCost));
      }
    }
  };

  const renderItem = ({ item, index }) => (
    <View
      style={[
        styles.row,
        { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff" },
      ]}
    >
      <View style={styles.cell}>
        <Text style={styles.cellText}>{item.const_name}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.amountText}>${item.amount}</Text>
      </View>
      <View style={styles.cell}>
        <Text>{item.duration}</Text>
      </View>
      <View style={styles.actionCell}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleUpdate(item)}
        >
          <Icon name="pencil" size={24} color="#7ba1ed" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleDelete(item.id)}
        >
          <Icon name="trash" size={24} color="#fa525b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Const Name</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Amount</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Duration</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Action</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <FlatList
            data={costList}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.downloadButton} onPress={handleOpen}>
          <Icon name="plus" size={24} color="#000" />
          <Text style={styles.downloadText}>Add New Recurring Cost</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Recurring - Cost</Text>
            <TextInput
              style={[styles.textInput, errors.costName && styles.inputError]}
              value={costName}
              onChangeText={setCostName}
              placeholder="Enter Cost Name"
            />
            {errors.costName ? (
              <Text style={styles.errorText}>{errors.costName}</Text>
            ) : null}
            <TextInput
              style={[styles.textInput, errors.amount && styles.inputError]}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter Amount"
            />
            {errors.amount ? (
              <Text style={styles.errorText}>{errors.amount}</Text>
            ) : null}
            <RadioButtonGroup
              containerStyle={styles.radioGroup}
              selected={duration}
              onSelected={(value) => setDuration(value)}
            >
              <RadioButtonItem
                value="Monthly"
                label={<Text style={{ marginBottom: 5 }}>Monthly</Text>}
                style={{ marginBottom: 5 }}
              />
              <RadioButtonItem
                value="Yearly"
                label={<Text style={{ marginBottom: 5 }}>Yearly</Text>}
                style={{ marginBottom: 5 }}
              />
              <RadioButtonItem
                value="Daily"
                label={<Text style={{ marginBottom: 5 }}>Daily</Text>}
                style={{ marginBottom: 5 }}
              />
            </RadioButtonGroup>
            {errors.duration ? (
              <Text style={styles.errorText}>{errors.duration}</Text>
            ) : null}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.customButton, styles.cancelButton]}
                onPress={() => handleClose()}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.customButton, styles.addButton]}
                onPress={handleAddCost}
              >
                <Text style={styles.buttonText}>Add Cost</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#2196f3",
  },
  headerCell: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#ffffff",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: {
    textAlign: "center",
    fontSize: 16,
    color: "#333",
  },
  amountText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#4caf50",
  },
  actionCell: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0f4f8",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  downloadText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
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
    marginBottom: 10,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "600",
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
  radioGroup: {
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    width: "100%",
  },
});

export default RecurringCost;
