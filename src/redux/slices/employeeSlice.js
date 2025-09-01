import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedEmployeeIds: [], // lưu id nhân viên được chọn
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    setSelectedEmployeeIds: (state, action) => {
      state.selectedEmployeeIds = action.payload;
    },
    addEmployeeId: (state, action) => {
      if (!state.selectedEmployeeIds.includes(action.payload)) {
        state.selectedEmployeeIds.push(action.payload);
      }
    },
    removeEmployeeId: (state, action) => {
      state.selectedEmployeeIds = state.selectedEmployeeIds.filter(
        (id) => id !== action.payload
      );
    },
    clearSelectedEmployeeIds: (state) => {
      state.selectedEmployeeIds = [];
    },
  },
});

export const {
  setSelectedEmployeeIds,
  addEmployeeId,
  removeEmployeeId,
  clearSelectedEmployeeIds,
} = employeeSlice.actions;

export default employeeSlice.reducer;
