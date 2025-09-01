// redux/slices/householdSlice.js
import { createSlice } from "@reduxjs/toolkit";

const householdSlice = createSlice({
  name: "household",
  initialState: {
    selectedHouseholds: [],
  },
  reducers: {
    setSelectedHouseholds: (state, action) => {
      state.selectedHouseholds = action.payload;
    },
    addHousehold: (state, action) => {
      if (!state.selectedHouseholds.find(h => h.id === action.payload.id)) {
        state.selectedHouseholds.push(action.payload);
      }
    },
    removeHousehold: (state, action) => {
      state.selectedHouseholds = state.selectedHouseholds.filter(h => h.id !== action.payload);
    },
    clearHouseholds: (state) => {
      state.selectedHouseholds = [];
    },
  },
});

export const { setSelectedHouseholds, addHousehold, removeHousehold, clearHouseholds } = householdSlice.actions;
export default householdSlice.reducer;
