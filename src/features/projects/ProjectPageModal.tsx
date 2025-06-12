import { useEffect, useState } from 'react';
import { ProjectDetailedModel } from '../../models/ProjectDetailedModel';
import { createProject, deleteProject, fetchDetailedProjectById, updateProject } from '../../api/ProjectsApi';
import { fetchEmployeesWithImagesAll } from '../../api/EmployeesApi';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { TeamNameModel } from '../../models/TeamNameModel';
import { fetchAllTeamsNameDto } from '../../api/TeamsApi';
import { EmployeeNameAndImageModel } from '../../models/EmployeeNameAndImageModel';
import { CustomDropdown } from '../../components/common/CustomDropdown';
import { EmployeeImageDisplay } from '../../components/common/EmployeeImageDisplay';
import { ProjectModel } from '../../models/ProjectModel';
import { useAuth } from '../../context/AuthContext';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/toastSlice';

import './ProjectPageModal.scss'
import { IconBin } from '../../components/common/icons';

interface ProjectPageModalProps {
  project: ProjectDetailedModel;
  onClose: () => void;
  onProjectUpdated: (updatedProject: ProjectDetailedModel) => void;
}

export function ProjectPageModal ({ project, onClose, onProjectUpdated }: ProjectPageModalProps) {
  const { state } = useAuth();
  const dispatch = useDispatch();
  
  const [formProject, setFormProject] = useState<ProjectDetailedModel>({ ...project });
  const [employees, setEmployees] = useState<EmployeeNameAndImageModel[]>([]);
  const [newParticipantId, setNewParticipantId] = useState<string>('');
  const [newTeamId, setNewTeamId] = useState<string>('');
  const [allTeams, setAllTeams] = useState<TeamNameModel[]>([]);
  const [participantResetTrigger, setParticipantResetTrigger] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isUserCreator = state.user?.employeeId === formProject.createdByEmployee.employeeId;

  useEffect(() => {
    
    const getEmployees = async () => {
      const employeesData = await fetchEmployeesWithImagesAll();
      setEmployees(employeesData);
    };

    getEmployees();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetAllTeams = async () => {
    if (allTeams.length === 0) {
      try {
        const teamsData = await fetchAllTeamsNameDto();
        setAllTeams(teamsData);
      } catch (error) {
        console.error('Failed to fetch teams', error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormProject(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddParticipant = (employeeId: string) => {
    setNewParticipantId(employeeId);
      
    const existingParticipant = formProject.participants.find(
        participant => participant.employeeId === employeeId
    );

    if (!existingParticipant) {
        const newParticipant = employees.find(emp => emp.employeeId === employeeId);
        if (newParticipant) {
            const updatedParticipants = [...formProject.participants, newParticipant];
            setFormProject(prevState => ({
                ...prevState,
                participants: updatedParticipants,
            }));
        }
    } else {
        console.warn(`${existingParticipant.firstName} ${existingParticipant.lastName} is already assigned to the project.`);
        setNewParticipantId("");
        setParticipantResetTrigger(prev => !prev);
    }
    
  };

  const handleAddTeam = () => {
    if (newTeamId) {
      // Check if the team is already in the list
      const existingTeam = formProject.teams.find(
          team => team.teamId === newTeamId
      );

      if (!existingTeam) {
          const newTeam = allTeams.find(team => team.teamId === newTeamId);
          if (newTeam) {
              const updatedTeams = [...formProject.teams, newTeam];
              setFormProject(prevState => ({
                  ...prevState,
                  teams: updatedTeams,
              }));
          }
      } else {
          console.warn(`${existingTeam.teamName} is already added to the project.`);
          setNewTeamId("");
      }
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      const projectTeamIds = formProject.teams
        .map(team => team.teamId)
        .filter((teamId): teamId is string => teamId !== undefined);

      const projectParticipantsIds = formProject.participants
        .map(employee => employee.employeeId)
        .filter((employeeId): employeeId is string => employeeId !== undefined);


      const projectToBeUpdated: ProjectModel = {
        projectId: formProject.projectId,
        projectName: formProject.projectName,
        teamIds: projectTeamIds,
        participantIds: projectParticipantsIds,
        createdById: formProject.createdByEmployee.employeeId,
        status: formProject.status?.trim() || 'NOT_STARTED',
        progress: formProject.progress,

        startDate: formProject.startDate,
        initialDeadlineDate: formProject.initialDeadlineDate,
        endDate: formProject.endDate,
      };

      console.log("projectToBeUpdated", projectToBeUpdated);

      if (!formProject.projectId && state.user) {
          const createdProject = await createProject(projectToBeUpdated);
          if (!createdProject.projectId) {
            console.log("Project ID missing after creation");
          } 
          else {
          const detailedProject = await fetchDetailedProjectById(createdProject.projectId); 
          onProjectUpdated(detailedProject);
          dispatch(showToast({
            status: 'success',
            message: 'Project created successfully',
          }));
          }
      } else {
          await updateProject(projectToBeUpdated, formProject.projectId!);
          onProjectUpdated(formProject);
          dispatch(showToast({
            status: 'success',
            message: 'Project updated successfully',
          }));
      }

      onClose();
    } catch (error) {
        console.error('Failed to update project', error);
        dispatch(showToast({
          status: 'error',
          message: 'Failed to save project.',
        }));
    }
  };

  const handleDelete = () => {
    console.log("Pressed delete button");
    setShowDeleteConfirm(true);
  }

  const confirmDelete = async () => {
    const userId = state.user?.employeeId;
    const creatorId = formProject.createdByEmployee.employeeId;
  
    if (userId !== creatorId) {
      dispatch(showToast({
        status: 'warning',
        message: 'You do not have permission to delete this project. Please contact the person who created it.',
      }));
      setShowDeleteConfirm(false);
      return;
    }
  
    try {
      if (formProject.projectId) {
        await deleteProject(formProject.projectId);
        dispatch(showToast({
          status: 'success',
          message: 'Project deleted successfully.',
        }));
        onClose();
      } else {
        dispatch(showToast({
          status: 'error',
          message: 'No project ID found.',
        }));
      }
      
    } catch (error) {
      console.error('Delete failed:', error);
      dispatch(showToast({
        status: 'error',
        message: 'Failed to delete project.',
      }));
    }
  
    setShowDeleteConfirm(false);
  };
  
  const cancelDelete = () => {
    console.log('Cancelled');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="project-modal">
      <h1 className='project-title'>{project.projectName}</h1>
      
      <form onSubmit={handleSubmit}>

        <div className='project-form-item'>
          <label htmlFor="title">
            Title:
          </label>
          <input 
            type="text" 
            id="projectName" 
            name="projectName" 
            value={formProject.projectName} 
            onChange={handleChange} 
            required />
        </div>

        <div className='project-form-item'>
          <h3>Project participants: </h3>
          <div className='new-line-list-items'>
            {formProject.participants.map(participant => (
              <div key={participant.employeeId} className="employee-item">
                <EmployeeImageDisplay employee={participant}/>
                <p className="employee-name">{participant.firstName} {participant.lastName}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="project-form-item">
          <label htmlFor="selectedEmployeeId">Add participant:</label>
          <CustomDropdown
            employees={employees}
            setSelectedEmployeeId={setNewParticipantId}
            handleEmployeeAction={handleAddParticipant}
            placeholderText="Search new participant"
            resetTrigger={participantResetTrigger}
          />
        </div>

        <div className='project-form-item'>
          <h3>Project teams: </h3>
          <ul className='team-list'>
            {formProject.teams.map(team => (
              <li key={team.teamId}>{team.teamName}</li>
            ))}
          </ul>
        </div>

        <div className='project-form-item'>
          <label htmlFor="newTeamId">
            Add team:
          </label>
          <div className='input-with-button'>
            <select 
              id="newTeamId" 
              name="newTeamId" 
              value={newTeamId}
              onFocus={handleGetAllTeams}
              onChange={(e) => setNewTeamId(e.target.value)}
            >
              <option value="">None</option>
              {allTeams.map(team => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </option>
              ))}
            </select>
        
            <button type="button" className='confirm-button' onClick={handleAddTeam}>
              Add
            </button>
          </div>
        </div>


        <div className='project-form-item'>
          <label htmlFor="status">
            Status:
          </label>
          <select id="status" name="status" value={formProject.status} onChange={handleChange}>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div className='project-form-item'>
          <label htmlFor="progress">Progress (%):</label>
          <input
            type="number"
            min={0}
            max={100}
            value={formProject.progress}
            onChange={handleChange}
            style={{ width: '60px'}}
          />
        </div>

        <div className='project-form-item'>
          <label htmlFor="progress"></label>
          <input
            type="range"
            id="progress"
            name="progress"
            min={0}
            max={100}
            value={formProject.progress}
            onChange={handleChange}
          />
        </div>

        {formProject.status.toLowerCase() !== 'not started' && (
          <div className='project-form-item'>
            <label htmlFor="startDate">Start date:</label>
            <DatePicker
              selected={formProject.startDate ? new Date(formProject.startDate) : null}
              onChange={(date: Date | null) => {
                setFormProject(prevState => ({
                  ...prevState,
                  startDate: date
                }));
              }}
              showTimeSelect
              dateFormat="dd MMMM yyyy, HH:mm"
              timeFormat="HH:mm"
              placeholderText="Select start date"
              className="datepicker-input"
            />
          </div>
        )}

        {/* {formProject.status.toLowerCase() !== 'not_started' && (
          <div className='project-form-item'>
            <label htmlFor="startDate">
              Start date:
            </label>
            <input 
              type="text" 
              id="startDate" 
              value={formProject.startDate 
                ? format(new Date(formProject.startDate), 'dd MMMM yyyy, HH:mm') 
                : ''}
              readOnly 
            />
          </div>
        )} */}

        {formProject.status.toLowerCase() === 'done' && (
          <div className='project-form-item'>
            <label htmlFor="endDate">
              End date:
            </label>
            <input 
              type="text" 
              id="endDate" 
              value={formProject.endDate 
                ? format(new Date(formProject.endDate), 'dd MMMM yyyy, HH:mm') 
                : ''}
              readOnly 
            />
          </div>
        )}

        <div className='project-form-item'>
          <label htmlFor="initialDeadlineDate">
            Deadline:
          </label>
          <DatePicker
            selected={formProject.initialDeadlineDate ? new Date(formProject.initialDeadlineDate) : null}
            onChange={(date: Date | null) => {
              setFormProject(prevState => ({
                ...prevState,
                initialDeadlineDate: date,
              }));
            }}
            showTimeSelect
            dateFormat="dd MMMM yyyy, HH:mm" 
            timeFormat="HH:mm" 
            placeholderText="Select deadline"
            className="datepicker-input"
          />
        </div>
        
        <div className='project-form-item'>
          <label htmlFor="createdByEmployee">
            Created by:
          </label>
          <input 
            type="text" 
            id="createdByEmployee" 
            value={`${formProject.createdByEmployee.firstName} ${formProject.createdByEmployee.lastName}`} 
            readOnly 
          />
        </div>

        <div className='project-form-item'>
          <label></label>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="icon-button" onClick={handleDelete}>
              <IconBin size={20} color="grey" />
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirmation">
            {isUserCreator ? (
              <>
                <p>Are you sure you want to delete this project?</p>
                <p>All tasks under this project will have their project reference removed.</p>
                <div className='project-form-submit-buttons'>
                  <button type="button" onClick={confirmDelete}>Confirm</button>
                  <button type="button" onClick={cancelDelete}>Cancel</button>
                </div>
              </>
            ) : (
              <p>You do not have permission to delete this project. Please contact the person who created it.</p>
            )}
          </div>
        )}

        <div className='project-form-submit-buttons'>
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>

      </form>
    </div>
  );
};