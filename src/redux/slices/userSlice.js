import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null, 
    access_token: '',
    
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Cập nhật thông tin người dùng
        updateUser: (state, action) => {
            state.user = action.payload;
            state.access_token = action.payload.access_token;
        },
        resetUser: (state) => {
            state.user = null;
        },
    },
});


export const { updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;

