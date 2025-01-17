import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Loader';
import { AppRoutes } from './AppRoutes';

type PrivateRouteProps = {
  children: ReactElement;
};

export const PrivateRoute = ({ children }: PrivateRouteProps): ReactElement  => {
  const { state } = useAuth();

  if (state.loading) {
    return <Loader />; 
  }

  return state.isAuthenticated ? children : <Navigate to={AppRoutes.LOGIN} />;
};