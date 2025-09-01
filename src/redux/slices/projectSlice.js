import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projects: [],
  selectedHouseholds: [],
  selectedEmployees: [],
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    // Households
    addHousehold: (state, action) => {
      state.selectedHouseholds.push(action.payload);
    },
    removeHousehold: (state, action) => {
      state.selectedHouseholds = state.selectedHouseholds.filter(
        (h) => h.id !== action.payload.id
      );
    },
    clearHouseholds: (state) => {
      state.selectedHouseholds = [];
    },
    setSelectedHouseholds: (state, action) => {
      state.selectedHouseholds = action.payload; // set mảng trực tiếp
    },

    // Employees
    addEmployee: (state, action) => {
      state.selectedEmployees.push(action.payload);
    },
    removeEmployee: (state, action) => {
      state.selectedEmployees = state.selectedEmployees.filter(
        (e) => e.id !== action.payload.id
      );
    },
    clearEmployees: (state) => {
      state.selectedEmployees = [];
    },
    setSelectedEmployees: (state, action) => {
      state.selectedEmployees = action.payload; // set mảng trực tiếp
    },
    //ReOpenModal
    setReopenModal: (state, action) => {
      state.reopenModal = action.payload;  // "view" | "edit" | null
    },
    clearReopenModal: (state) => {
      state.reopenModal = null;
    },
  },
});

export const {
  addHousehold,
  removeHousehold,
  clearHouseholds,
  setSelectedHouseholds,
  addEmployee,
  removeEmployee,
  clearEmployees,
  setSelectedEmployees,
  setReopenModal,
  clearReopenModal
} = projectSlice.actions;

export default projectSlice.reducer;
