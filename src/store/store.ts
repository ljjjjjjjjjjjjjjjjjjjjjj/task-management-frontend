import { configureStore } from '@reduxjs/toolkit';
import currentPageReducer from './currentPageSlice';
import toastReducer from './toastSlice'

const store = configureStore({
  reducer: {
    currentPage: currentPageReducer,
    toast: toastReducer
  }
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;