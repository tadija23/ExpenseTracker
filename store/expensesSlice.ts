import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
};

type ExpensesState = {
  expenses: Expense[];
  loading: boolean;
};

const initialState: ExpensesState = {
  expenses: [],
  loading: true,
};

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
      state.loading = false;
    },
    addExpenseToStore: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload);
    },
    deleteExpenseFromStore: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== action.payload
      );
    },
    setExpensesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setExpenses,
  addExpenseToStore,
  deleteExpenseFromStore,
  setExpensesLoading,
} = expensesSlice.actions;

export default expensesSlice.reducer;