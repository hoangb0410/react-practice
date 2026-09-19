import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import { localStorageEngine } from './storage';
import { userReducer } from './user';

const localPersistConfig = (key: string) => ({
  key,
  storage: localStorageEngine,
});

const appReducer = combineReducers({
  user: persistReducer(localPersistConfig('user'), userReducer),
});

export type RootState = ReturnType<typeof appReducer>;

const store = configureStore({
  reducer: appReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
export default store;
