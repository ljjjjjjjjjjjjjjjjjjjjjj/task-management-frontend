import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import { ProjectModel } from '../../models/ProjectModel';
import { TaskDetailedModel } from '../../models/TaskDetailedModel';
import { fetchTasksDetailedByAssignedToId, fetchTasksDetailedByCreatedById } from '../../api/TasksApi';
import { fetchUserProjects } from '../../api/ProjectsApi';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './Overview.scss'

ChartJS.register(ArcElement, Tooltip, Legend);


export function Overview() {
  const { state } = useAuth();

  const [taskList, setTaskList] = useState<TaskDetailedModel[]>([]);
  const [taskCountAssignedTo, setTaskCountAssignedTo] = useState<number | null>(null);
  const [taskCountCreatedBy, setTaskCountCreatedBy] = useState<number | null>(null);
  const [taskCountTotal, setTaskCountTotal] = useState<number | null>(null);

  const [projectList, setProjectList] = useState<ProjectModel[]>([]);
  const [projectCountAssignedTo, setProjectCountAssignedTo] = useState<number | null>(null);
  const [projectCountCreatedBy, setProjectCountCreatedBy] = useState<number | null>(null);
 
  const [errorMessage, setErrorMessage] = useState<string>("");



  //////////////////////////////////////////////////////////////////////////////

  const [createdProjectsCount, setCreatedProjectsCount] = useState<number>(0); 
  const [assignedProjectsCount, setAssignedProjectsCount] = useState<number>(0); 
  const [projectsByStatus, setProjectsByStatus] = useState<Record<string, number>>({}); 
  const [progressAverages, setProgressAverages] = useState<number>(0); 

  const [tasksCreatedCount, setTasksCreatedCount] = useState<number>(0);
  const [tasksAssignedCount, setTasksAssignedCount] = useState<number>(0);
  const [tasksByStatus, setTasksByStatus] = useState<Record<string, number>>({});


  //////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const getTaskList = async () => {
      try {
        if (!state.user?.employeeId) return;    

        const employeeId = state.user.employeeId;
        setErrorMessage("");    

        const fetchedTasksAssignedTo = await fetchTasksDetailedByAssignedToId(employeeId);
        const fetchedTasksCreatedBy = await fetchTasksDetailedByCreatedById(employeeId);    

        setTasksAssignedCount(fetchedTasksAssignedTo.length);
        setTasksCreatedCount(fetchedTasksCreatedBy.length);
        setTaskCountTotal(fetchedTasksAssignedTo.length + fetchedTasksCreatedBy.length);    

        // Combine tasks for stats
        const allTasks = [...fetchedTasksAssignedTo, ...fetchedTasksCreatedBy];    

        const statusCounts: Record<string, number> = {};
        allTasks.forEach(task => {
          const status = task.status || 'UNKNOWN';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        setTasksByStatus(statusCounts);
      } catch (error) {
        console.error('Failed to fetch tasks', error);
        setErrorMessage("Failed to fetch tasks. Please try again later.");
      }
    };

    // const getUserProjects = async () => {
    //   try {
    //     if (state.user?.employeeId) {
    //       const fetchedProjects = await fetchUserProjects(state.user.employeeId);
    //       setProjectList(fetchedProjects);
    //     }
    //   } catch (error) {
    //     console.error('Failed to fetch projects', error);
    //   }
    // };

    const getUserProjects = async () => {
      try {

        if (state.user?.employeeId) {

          const employeeId = state.user.employeeId;

          const fetchedProjects = await fetchUserProjects(state.user.employeeId);
          setProjectList(fetchedProjects);
    
          // ✅ Created by me
          const created = fetchedProjects.filter(p => p.createdById === employeeId);
          setCreatedProjectsCount(created.length);
    
          // ✅ Assigned to me
          const assigned = fetchedProjects.filter(p => p.participantIds.includes(employeeId));
          setAssignedProjectsCount(assigned.length);
    
          // ✅ Projects by status
          const statusCounts: Record<string, number> = {};
          fetchedProjects.forEach(p => {
            statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
          });
          setProjectsByStatus(statusCounts);
    
          // ✅ Progress average
          const totalProgress = fetchedProjects.reduce((sum, p) => sum + (p.progress || 0), 0);
          const avgProgress = fetchedProjects.length > 0 ? totalProgress / fetchedProjects.length : 0;
          setProgressAverages(Math.round(avgProgress));
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };

    getTaskList();
    getUserProjects();
  }, [state.user]);

  useEffect(() => {
    if (taskCountAssignedTo !== null && taskCountCreatedBy !== null) {
      setTaskCountTotal(taskCountAssignedTo + taskCountCreatedBy);
    }
  }, [taskCountAssignedTo, taskCountCreatedBy]);

  const data = {
    labels: ['Assigned To', 'Created By'],
    datasets: [
      {
        data: [taskCountAssignedTo, taskCountCreatedBy],
        backgroundColor: ['#4caf50', '#03a9f4'], // green and light blue
        hoverBackgroundColor: ['#66bb6a', '#29b6f6'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: '70%', // This makes the donut chart hollow
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
    },
  };

  const statusChartData = {
    labels: Object.keys(projectsByStatus),
    datasets: [
      {
        data: Object.values(projectsByStatus),
        backgroundColor: ['#2196f3', '#ff9800', '#4caf50', '#f44336'],
        hoverBackgroundColor: ['#64b5f6', '#ffb74d', '#81c784', '#e57373'],
        borderWidth: 0,
      },
    ],
  };
  
  const taskStatusChartData = {
    labels: Object.keys(tasksByStatus),
    datasets: [
      {
        data: Object.values(tasksByStatus),
        backgroundColor: ['#f44336', '#ff9800', '#4caf50', '#03a9f4'],
        hoverBackgroundColor: ['#e57373', '#ffb74d', '#81c784', '#64b5f6'],
        borderWidth: 0,
      },
    ],
  };

  
  return (
    <div className='overview-container'>
      <h1>Overview</h1>

      <div className='overview-chart-container'>

        <div className='overview-chart-item'>
          <h3>Tasks</h3>
          <div className="chart">
            <Doughnut data={data} options={options} />
          </div>
          <p>Assigned: {taskCountAssignedTo}</p>
          <p>Created: {taskCountCreatedBy}</p>
          <p>Total: {taskCountTotal}</p>
        
        </div>
  
  
        <div className='overview-chart-item'>
          <h3>Projects</h3>
          <div className="chart">
            <Doughnut data={data} options={options} />
          </div>
          <p>Assigned: {taskCountAssignedTo}</p>
          <p>Created: {taskCountCreatedBy}</p>
          <p>Total: {taskCountTotal}</p>
        
        </div>

        <div className="overview-chart-item">
          <h3>Projects by Status</h3>

          <div className="chart">
            <Doughnut data={statusChartData} options={options} />
          </div>
        
          <h3>Projects Stats</h3>
          <p>Created by me: {createdProjectsCount}</p>
          <p>I'm a participant in: {assignedProjectsCount}</p>
          <p>Average Progress: {progressAverages}%</p>
        </div>
  
  
        <div className="overview-chart-item">
          <h3>Tasks by Status</h3>
        
          <div className="chart">
            <Doughnut data={taskStatusChartData} options={options} />
          </div>
        
          <h3>Task Stats</h3>
          <p>Created by me: {tasksCreatedCount}</p>
          <p>Assigned to me: {tasksAssignedCount}</p>
          <p>Total tasks: {taskCountTotal}</p>
        </div>


      </div>


      <h3>Projectss</h3>
      <p>Tasks</p>
      <p>Tasks</p>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}


    </div>
  );
}
