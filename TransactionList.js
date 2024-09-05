import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet, Platform,
  Alert,
  ScrollView
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteTransaction } from "./transactionsSlice";
import Icon from "react-native-vector-icons/FontAwesome";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

const TransactionList = ({ navigation }) => {
  const transactions = useSelector((state) => state.transactions.transactions);
  const dispatch = useDispatch();

  const handleDelete = (id) => {
    dispatch(deleteTransaction(id));
  };

  const exportToExcel = async () => {
    try {
      const formattedTransactions = transactions.map(({ id, ...rest }) => rest);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(formattedTransactions, {
        header: ["description", "amount", "type", "date"],
      });
      ws["!cols"] = [{ wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 20 }];

      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { horizontal: "center" },
      };

      const headers = ["A1", "B1", "C1", "D1"];
      headers.forEach((cell) => {
        ws[cell].s = headerStyle;
      });

      const dataStyle = {
        alignment: { horizontal: "center" },
      };
      Object.keys(ws)
        .filter((key) => key[0] !== "!")
        .forEach((cell) => {
          if (cell[1] !== "1") ws[cell].s = dataStyle;
        });

      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      if (Platform.OS === "web") {
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        FileSaver.saveAs(blob, "transactions.xlsx");
      } else {
        const fileUri = FileSystem.documentDirectory + "transactions.xlsx";
        await FileSystem.writeAsStringAsync(fileUri, wbout, {
          encoding: FileSystem.EncodingType.Base64,
        });
        Alert.alert("Success", `File has been saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while exporting to Excel.");
    }
  };

  const renderItem = ({ item, index }) => (
    <View
      style={[
        styles.row,
        { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff" }, // Alternate row colors
      ]}
    >
      <View style={styles.cell}>
        <Text style={styles.cellText}>{item.description}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.amountText}>${item.amount}</Text>
      </View>
      <View style={styles.cell}>
        <Text
          style={[
            styles.cellText,
            { color: item.type === "Income" ? "#4caf50" : "#f44336" }, // Green for Income, Red for Expense
          ]}
        >
          {item.type}
        </Text>
      </View>
      <View style={styles.actionCell}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("Update Transaction", { ...item })}
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
            <Text style={styles.headerText}>Description</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Amount</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Type</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Action</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.downloadButton} onPress={exportToExcel}>
          <Icon name="download" size={24} color="#ffffff" />
          <Text style={styles.downloadText}>Download Excel</Text>
        </TouchableOpacity>
      </View>
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
    color: "#ffffff",
  },
});

export default TransactionList;
