import React, { useEffect, useState } from 'react';
import { fetchTasksDetailedByEmployeeId, fetchTasksDetailedByProjectId } from '../../api/TasksApi';
import { ProjectModel } from '../../models/ProjectModel';
import { fetchUserProjects } from '../../api/ProjectsApi';
import { useAuth } from '../../context/AuthContext';
import { TaskDescription } from './TaskDescription';
import { TaskPageModal } from './TaskPageModal';
import { TaskDetailedModel } from '../../models/TaskDetailedModel';

import './Tasks.scss'

export function Tasks () {
  const { state } = useAuth();

  const [taskList, setTaskList] = useState<TaskDetailedModel[]>([]);
  const [projectList, setProjectList] = useState<ProjectModel[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskDetailedModel | null>(null);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const getTaskList = async () => {
      try {
        if (state.user?.employeeId) {
        setErrorMessage("");
        const fetchedTasks = selectedProjectId
            ? await fetchTasksDetailedByProjectId(selectedProjectId)
            : await fetchTasksDetailedByEmployeeId(state.user.employeeId);
        
        if (fetchedTasks.length === 0) {
          setErrorMessage("No tasks were found.");
        } else {
          setTaskList(fetchedTasks);
        }
      }
      } catch (error) {
        console.error('Failed to fetch tasks', error);
        setErrorMessage("Failed to fetch tasks. Please try again later.");
      }
    };

    const getUserProjects = async () => {
      try {
        if (state.user?.employeeId) {
          const fetchedProjects = await fetchUserProjects(state.user.employeeId);
          setProjectList(fetchedProjects);
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };

    getTaskList();
    getUserProjects();
  }, [state.user, selectedProjectId]);

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = event.target.value;
    setSelectedProjectId(projectId || null);
  };

  const filteredTasks = selectedProjectId
  ? taskList.filter(task => task.projectId === selectedProjectId)
  : taskList.filter(task => !task.projectId);

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const openTaskModal = (task: TaskDetailedModel) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeTaskCard = () => { 
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const handleTaskUpdated = (updatedTask: TaskDetailedModel) => {
    console.log("before setTaskList: ", taskList);
    setTaskList(prevTasks => {
    const exists = prevTasks.some(task => task.taskId === updatedTask.taskId);

    if (exists) {
      return prevTasks.map(task => 
        task.taskId === updatedTask.taskId ? updatedTask : task
      );
    }

    return [updatedTask, ...prevTasks];
  });
  };

  const createNewTask = () => {
    const newTask : TaskDetailedModel = {
      taskId: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'NOT_STARTED',
        projectId: '',
        category: { categoryId: '', name: '' },
        assignedToEmployee: undefined,
        createdByEmployee: {
            employeeId: state.user?.employeeId || '',
            firstName: state.user?.firstName || 'Unknown',
            lastName: state.user?.lastName || 'User',
            imageId: '',
            imageData: ''
        },
        createdDate: new Date(),
        assignedDate: new Date(),
    };
    setSelectedTask(newTask);
    setIsModalOpen(true);
  };



  // console logs:
  useEffect(() => {
    console.log("taskList", taskList)
  },
  [taskList])

    
  return (
    <div className='tasks-container'>

      <div className='tasks-header'>

        <div className='tasks-header-title'>

          {/* Dropdown list */}
          <select className='select-basic' onChange={handleProjectChange} value={selectedProjectId || ""}>
            <option value="">Individual tasks</option>
            {projectList.map(project => (
              <option key={project.projectId} value={project.projectId}>
                {project.projectName}
              </option>
            ))}
          </select>
      </div>

        <div className='tasks-header-subtitle'>
          <button onClick={createNewTask} className='button-basic-gray'>Create new task</button>
        </div>

        <div className='tasks-header-subtitle'>
          <button className='button-basic-gray'>Another select</button>
        </div>

      </div>


      <div className='tasks-status-container'>
        {['NOT_STARTED', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map(status => (
          <div className='tasks-status-item' key={status}>
            <h3>{status.replace('_', ' ')} ({getTasksByStatus(status).length})</h3>
            <div>
            {getTasksByStatus(status).map(task => (
                <TaskDescription key={task.taskId} task={task} onClick={() => openTaskModal(task)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className='modal-overlay' onClick={closeTaskCard}>
          <div className='modal-content' onClick={e => e.stopPropagation()}>
            <button className='close-button' onClick={closeTaskCard}></button>
            {selectedTask && (
              <TaskPageModal task={selectedTask} onClose={closeTaskCard} onTaskUpdated={handleTaskUpdated} />
            )}
          </div>
        </div>
      )}
  
      {errorMessage && <p>{errorMessage}</p>} 

    </div>
    );
  };
