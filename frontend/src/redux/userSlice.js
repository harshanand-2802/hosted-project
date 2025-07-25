import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: null,
  email: null,
  photo: null,
  _id: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.photo = action.payload.photo;
      state._id = action.payload._id;
    },
    clearUser: (state) => {
      state.username = null;
      state.email = null;
      state.photo = null;
      state._id = null;
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
