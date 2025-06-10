import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToastStatus = 'success' | 'error' |'warning' | 'info';

export interface ToastState {
  message: string;
  status: ToastStatus;
}

const initialState: ToastState | null = null;

const toastSlice = createSlice({
  name: 'toast',
  initialState: initialState as ToastState | null,
  reducers: {
    showToast: (_, action: PayloadAction<ToastState>) => action.payload,
    clearToast: () => null,
  },
});

export const { showToast, clearToast } = toastSlice.actions;
export default toastSlice.reducer;
