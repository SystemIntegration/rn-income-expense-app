import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { addTransaction, editRecurringTransaction } from "./transactionsSlice";

const Dashboard = () => {
  const transactions = useSelector((state) => state.transactions.transactions);
  const categories = useSelector((state) => state.transactions.category);
  const costList = useSelector(
    (state) => state.transactions.recurringTransactions
  );
  const dispatch = useDispatch();
  function generateColor(index) {
    const hue = (index * 137.5) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  const checkAndAddTransaction = () => {
    costList.map((cost) => {
      if (moment().format("DD-MM-YYYY") === cost.nextdate) {
        const newTransaction = {
          description: cost.const_name,
          amount: cost.amount,
          id: Date.now().toString(),
          type: "Expense",
          date: moment().format("DD-MM-YYYY"),
          category: "recurring",
        };
        dispatch(addTransaction(newTransaction));

        const getNextDate = (duration) => {
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
          const_name: cost.const_name,
          amount: cost.amount,
          duration: cost.duration,
          id: cost.id,
          next: getNextDate(cost.duration),
        };
        dispatch(editRecurringTransaction(newCost));
      }
    });
  };

  useEffect(() => {
    checkAndAddTransaction();
  }, []);

  const totalIncome = transactions
    .filter((tx) => tx.type === "Income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === "Expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpenses;

  const graphData = [
    {
      name: "Income",
      cost: totalIncome,
      color: "rgba(131, 167, 234, 1)",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
    {
      name: "Expense",
      cost: totalExpenses,
      color: "#F00",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const dataByDay = {
    Income: Array(7).fill(0),
    Expense: Array(7).fill(0),
  };

  transactions.forEach((transaction) => {
    const dayOfWeek = moment(transaction.date, "DD-MM-YYYY").day();
    dataByDay[transaction.type][dayOfWeek] += transaction.amount;
  });

  const lineData = {
    labels: daysOfWeek,
    datasets: [
      {
        data: dataByDay.Income,
        color: (opacity = 1) => `rgba(0, 204, 255, ${opacity})`,
      },
      {
        data: dataByDay.Expense,
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
      },
    ],
    legend: ["Income", "Expenses"],
  };

  const pieCetegryData = () => {
    const data = categories.map((category, index) => {
      return {
        name: category,
        cost: transactions
          .filter((tx) => tx.category === category)
          .reduce((sum, tx) => sum + tx.amount, 0),
        color: generateColor(index),
        legendFontColor: "#212529",
        legendFontSize: 15,
      };
    });

    return data;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.row}>
        <View style={styles.box}>
          <Text style={styles.boxText}>Total Income</Text>
          <Text style={styles.amount}>${totalIncome.toFixed(2)}</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxText}>Total Expenses</Text>
          <Text style={styles.amount}>${totalExpenses.toFixed(2)}</Text>
        </View>
      </View>
      <View
        style={[
          styles.balanceBox,
          { backgroundColor: balance < 0 ? "#F00" : "#2196f3" },
        ]}
      >
        <Text style={styles.balanceText}>Balance</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
      </View>

      <View style={styles.graphView}>
        <Text style={styles.graphHeader}>Income vs. Expenses Overview</Text>
        <PieChart
          data={graphData}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2,
            barPercentage: 0.5,
            useShadowColorFromDataset: false,
          }}
          accessor={"cost"}
          backgroundColor={"transparent"}
          paddingLeft="15"
        />
      </View>

      <View style={styles.graphView}>
        <Text style={styles.graphHeader}>Weekly Financial Breakdown</Text>
        <LineChart
          data={lineData}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2,
            barPercentage: 0.5,
            useShadowColorFromDataset: false,
          }}
          bezier
          style={styles.lineChart}
        />
      </View>

      <View style={styles.graphView}>
        <Text style={styles.graphHeader}>Expense Distribution by Category</Text>
        <PieChart
          data={pieCetegryData()}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2,
            barPercentage: 0.5,
            useShadowColorFromDataset: false,
          }}
          accessor={"cost"}
          backgroundColor={"transparent"}
          paddingLeft="15"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f4f8",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  box: {
    flex: 1,
    marginHorizontal: 10,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: "center",
  },
  boxText: {
    fontSize: 18,
    fontWeight: "Bold",
    color: "black",
  },
  amount: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4caf50",
    marginTop: 8,
  },
  balanceBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  balanceText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
  },
  lineChart: {
    marginTop: 16,
  },
  graphHeader: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginVertical: 15,
  },
  graphView: {
    backgroundColor: "gainsboro",
    marginTop: "10px",
    borderRadius: "1rem",
  },
});

export default Dashboard;
