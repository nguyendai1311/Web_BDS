import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  households: {},
  employees: {},
};

const projectSelectionSlice = createSlice({
  name: "projectSelection",
  initialState,
  reducers: {
    setHouseholds: (state, action) => {
      const { projectId, data } = action.payload;
      state.households[projectId] = data;
    },
    setEmployees: (state, action) => {
      const { projectId, data } = action.payload;
      state.employees[projectId] = data;
    },
    addHousehold: (state, action) => {
      const { projectId, household } = action.payload;
      if (!state.households[projectId]) state.households[projectId] = [];
      state.households[projectId].push(household);
    },
    removeHousehold: (state, action) => {
      const { projectId, householdId } = action.payload;
      state.households[projectId] = state.households[projectId].filter(h => h.id !== householdId);
    },
    addEmployee: (state, action) => {
      const { projectId, employee } = action.payload;
      if (!state.employees[projectId]) state.employees[projectId] = [];
      state.employees[projectId].push(employee);
    },
    removeEmployee: (state, action) => {
      const { projectId, employeeId } = action.payload;
      state.employees[projectId] = state.employees[projectId].filter(e => e.id !== employeeId);
    },
    clearSelection: (state, action) => {
      const { projectId } = action.payload;
      delete state.households[projectId];
      delete state.employees[projectId];
    },
  },
});

export const {
  setHouseholds,
  setEmployees,
  addHousehold,
  removeHousehold,
  addEmployee,
  removeEmployee,
  clearSelection,
} = projectSelectionSlice.actions;

export default projectSelectionSlice.reducer;
