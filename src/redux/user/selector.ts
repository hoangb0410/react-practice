import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

const userState = (state: RootState) => state.user;

export const userSelector = createSelector(userState, (s) => s.user);
