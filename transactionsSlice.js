import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  transactions: [
    {
      description: "Grocery Shopping",
      amount: 50,
      id: 1,
      type: "Income",
      date: "01-09-2024",
      category: null,
    },
    {
      description: "Salary",
      amount: 1500,
      id: 2,
      type: "Income",
      date: "02-09-2024",
      category: null,
    },
    {
      description: "Coffee",
      amount: 120,
      id: 3,
      type: "Expense",
      date: "09-09-2024",
      category: "food",
    },
    {
      description: "Electricity Bill",
      amount: 75,
      id: 4,
      type: "Income",
      date: "03-09-2024",
      category: null,
    },
    {
      description: "Coffee",
      amount: 40,
      id: 5,
      type: "Expense",
      date: "03-09-2024",
      category: "health",
    },
    {
      description: "Bills",
      amount: 10,
      id: 6,
      type: "Expense",
      date: "03-09-2024",
      category: "education",
    },
    {
      description: "Service",
      amount: 40,
      id: 7,
      type: "Expense",
      date: "03-09-2024",
      category: "utilities",
    },
    {
      description: "Bus Travelling",
      amount: 40,
      id: 8,
      type: "Expense",
      date: "03-09-2024",
      category: "transportation",
    },
  ],
  category: [
    "food",
    "clothing",
    "rent",
    "utilities",
    "transportation",
    "entertainment",
    "health",
    "education",
    "recurring",
  ],
  recurringTransactions: [
    {
      const_name: "Home loan",
      amount: 100,
      id: 1,
      duration: "Monthly",
      nextdate: "30-09-2024",
    },
    {
      const_name: "Property Loan",
      amount: 5500,
      id: 2,
      duration: "Yearly",
      nextdate: "30-09-2024",
    },
    {
      const_name: "EMI",
      amount: 10,
      id: 3,
      duration: "Daily",
      nextdate: "05-09-2024",
    },
  ],
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    addTransaction: (state, action) => {
      state.transactions.push(action.payload);
    },
    editTransaction: (state, action) => {
      const index = state.transactions.findIndex(
        (tx) => tx.id === action.payload.id
      );
      if (index !== -1) state.transactions[index] = action.payload;
    },
    deleteTransaction: (state, action) => {
      state.transactions = state.transactions.filter(
        (tx) => tx.id !== action.payload
      );
    },
    addCategory: (state, action) => {
      state.category.push(action.payload);
    },
    addRecurringTransaction: (state, action) => {
      state.recurringTransactions.push(action.payload);
    },
    editRecurringTransaction: (state, action) => {
      const index = state.recurringTransactions.findIndex(
        (tx) => tx.id === action.payload.id
      );
      if (index !== -1) state.recurringTransactions[index] = action.payload;
    },
    deleteRecurringTransaction: (state, action) => {
      state.recurringTransactions = state.recurringTransactions.filter(
        (tx) => tx.id !== action.payload
      );
    },
  },
});

export const {
  addTransaction,
  editTransaction,
  deleteTransaction,
  addCategory,
  addRecurringTransaction,
  editRecurringTransaction,
  deleteRecurringTransaction,
} = transactionsSlice.actions;
export default transactionsSlice.reducer;
