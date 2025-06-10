import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { clearToast } from '../../store/toastSlice';

import './Toast.scss';

export const Toast = () => {
  const toast = useSelector((state: RootState) => state.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Toast useEffect entered")
    console.log("toast: ", toast)
    if (toast) {
      const timeout = setTimeout(() => dispatch(clearToast()), 3000);
      return () => clearTimeout(timeout);
    }
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
  <div className={`toast-container toast-${toast?.status || ''}`}>
    {toast?.message && <p className="toast-text">{toast.message}</p>}
  </div>
  );





};