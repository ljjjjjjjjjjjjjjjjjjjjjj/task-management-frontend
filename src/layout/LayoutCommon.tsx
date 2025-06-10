import React from 'react';
import { Sidebar } from '../components/sidebar/Sidebar';
import { Footer } from '../components/footer/Footer';
import { Header } from '../components/header/Header';
import { Outlet, useLocation } from 'react-router-dom';
import './LayoutCommon.scss';
import { useDispatch } from 'react-redux';
import { AppRoutes } from '../routes/AppRoutes';
import { resetCurrentPage, setCurrentPage } from '../store/currentPageSlice';
import { Toast } from '../components/common/Toast';

export function LayoutCommon () {
  const dispatch = useDispatch();
  const location = useLocation();

  React.useEffect(() => {
    let routePath = location.pathname;
    
    if (routePath.startsWith(AppRoutes.TASK.replace(':taskId', ''))) {
      routePath = AppRoutes.TASKS;
    }

    switch (routePath) {
      case AppRoutes.HOME:
        dispatch(setCurrentPage(AppRoutes.HOME));
        break;
      case AppRoutes.OVERVIEW:
        dispatch(setCurrentPage(AppRoutes.OVERVIEW));
        break;
      case AppRoutes.CALENDAR:
        dispatch(setCurrentPage(AppRoutes.CALENDAR));
        break;
      case AppRoutes.TASKS:
      case AppRoutes.TASK:
        dispatch(setCurrentPage(AppRoutes.TASKS));
        break;
      case AppRoutes.PROJECTS:
        dispatch(setCurrentPage(AppRoutes.PROJECTS));
        break;  
      case AppRoutes.SETTINGS:
        dispatch(setCurrentPage(AppRoutes.SETTINGS));
        break;
      default:
        dispatch(resetCurrentPage());
        break;
    }
  }, [location, dispatch]);
  
  return (
    <div className="layout-common">
      <Toast />
      
      <div className="header">
        <Header />
      </div>

      <div className="main-content">
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <div className="outlet-container">
          <Outlet />
        </div>
      </div>

      <div className="footer">
      <Footer />
      </div>

    </div>
  );
}



