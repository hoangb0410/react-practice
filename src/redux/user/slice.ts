import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUserInfo } from '@/interfaces';

interface IStateUser {
  user: IUserInfo | undefined;
}

const initialState: IStateUser = { user: undefined };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfoToRedux: (state, action: PayloadAction<IUserInfo>) => {
      state.user = action.payload;
    },
    resetUserInfoFromRedux: (state) => {
      state.user = undefined;
    },
  },
});

export const { setUserInfoToRedux, resetUserInfoFromRedux } = userSlice.actions;
export default userSlice.reducer;
