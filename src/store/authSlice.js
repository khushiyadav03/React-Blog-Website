import { createSlice } from "@reduxjs/toolkit";

// Auth ka initial state: by default user logged out hai.
const initialState = {
    status : false,
    userData: null
}

const toPlainUser = (userData) => {
    if (!userData) return null;

    return {
        $id: userData.$id,
        name: userData.name,
        email: userData.email,
        emailVerification: userData.emailVerification,
    };
};

// Redux slice jo login/logout state manage karta hai.
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: {
            reducer: (state, action) => {
                // Login ke baad status true aur user data store hota hai.
                state.status = true;
                state.userData = action.payload;
            },
            prepare: (userData) => ({
                payload: toPlainUser(userData),
            }),
        },
        logout: (state) => {
            // Logout par status false aur user data clear ho jata hai.
            state.status = false;
            state.userData = null;
        }
    }
});

export const {login, logout} = authSlice.actions;

export default authSlice.reducer;
