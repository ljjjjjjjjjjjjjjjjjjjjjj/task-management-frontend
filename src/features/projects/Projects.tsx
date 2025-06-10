import React, { useEffect, useState } from 'react';
import { fetchUserProjectsByStatus } from '../../api/ProjectsApi';
import { useAuth } from '../../context/AuthContext';

import { ProjectDetailedModel } from '../../models/ProjectDetailedModel';

import { ProjectDescription } from './ProjectDescription';
import { ProjectPageModal } from './ProjectPageModal';

import './Projects.scss'


export function Projects () {
  const { state } = useAuth();

  const [projectList, setProjectList] = useState<ProjectDetailedModel[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDetailedModel | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    
    const getUserProjects = async () => {
      try {
        if (state.user?.employeeId) {
          let fetchedProjects: ProjectDetailedModel[] = [];
          if (selectedStatus === 'ACTIVE') {
            const inProgressProjects = await fetchUserProjectsByStatus(state.user.employeeId, 'IN_PROGRESS');
            const inReviewProjects = await fetchUserProjectsByStatus(state.user.employeeId, 'IN_REVIEW');
            fetchedProjects = [...inProgressProjects, ...inReviewProjects];
          } else {
            fetchedProjects = await fetchUserProjectsByStatus(state.user.employeeId, selectedStatus);
          }
          setProjectList(fetchedProjects);
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
        setErrorMessage('Failed to fetch projects');
      }
    };

    getUserProjects();
  }, [state.user, selectedStatus]);

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const openProjectModal = (project: ProjectDetailedModel) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeProjectCard = () => { 
    setSelectedProject(null);
    setIsModalOpen(false);
  };

  const handleProjectUpdated = (updatedProject: ProjectDetailedModel) => {
    setProjectList(prevProjects => {
    const exists = prevProjects.some(project => project.projectId === updatedProject.projectId);

    if (exists) {
      return prevProjects.map(project =>
        project.projectId === updatedProject.projectId ? updatedProject : project
      );
    }
    return [updatedProject, ...prevProjects];
  });
  };

  const createNewProject = () => {
      const newProject : ProjectDetailedModel = {
          projectId: '',
          projectName: '',
          teams: [],
          participants: [],
          createdByEmployee: {
            employeeId: state.user?.employeeId || '',
            firstName: state.user?.firstName || 'Unknown',
            lastName: state.user?.lastName || 'User',
            imageId: '',
            imageData: ''
          },
          status: "",
          progress: 0,
          createdDate: new Date(),
          startDate: new Date(),
          initialDeadlineDate: new Date(),
          endDate: new Date()
      };

      setSelectedProject(newProject);
      setIsModalOpen(true);
    };

    
  return (
    <div className='projects-container'>

      <div className='projects-header'>

        <div className='projects-header-subtitle'>
          <select className='select-basic' onChange={handleStatusChange} value={selectedStatus}>
            <option value='ACTIVE'>Active</option>
            <option value='IN_PROGRESS'>In Progress</option>
            <option value='IN_REVIEW'>In Review</option>
            <option value='NOT_STARTED'>Not Started</option>
            <option value='DONE'>Done</option>
          </select>
        </div> 

        <div className='projects-header-subtitle'>
          <button className='button-basic-gray' onClick={createNewProject}>Create new project</button>
        </div>

        <div className='projects-header-subtitle'>
          <button className='button-basic-gray'>Another select</button>
        </div>

      </div>


      <div className='projects-status-container'>
        <h3>{formatStatus(selectedStatus)}</h3>

        <div className='projects-status-items'>
          {projectList.length === 0 ? (
            <p>No projects</p>
          ) : (
            projectList.map(project => (
              <ProjectDescription key={project.projectId} project={project} onClick={() => openProjectModal(project)} />
            ))
          )}
        </div>

      </div>

      {isModalOpen && (
        <div className='modal-overlay' onClick={closeProjectCard}>
          <div className='modal-content' onClick={e => e.stopPropagation()}>
            <button className='close-button' onClick={closeProjectCard}></button>
            {selectedProject && (
              <ProjectPageModal project={selectedProject} onClose={closeProjectCard} onProjectUpdated={handleProjectUpdated} />
            )}
          </div>
        </div>
      )}
  
      {errorMessage && <p>{errorMessage}</p>} 

    </div>
    );
  };
