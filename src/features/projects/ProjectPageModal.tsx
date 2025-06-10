import { useEffect, useState } from 'react';
import { ProjectDetailedModel } from '../../models/ProjectDetailedModel';
import { createProject, fetchDetailedProjectById, updateProject } from '../../api/ProjectsApi';
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
        status: formProject.status,
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

        <div className='project-form-item-with-new-line'>
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

        <CustomDropdown
          labelTitle="Add participant: "
          employees={employees}
          setSelectedEmployeeId={setNewParticipantId}  
          handleEmployeeAction={handleAddParticipant} 
          placeholderText="Search new participant" 
          resetTrigger={participantResetTrigger}
        />

        <div className='project-form-item-with-new-line'>
          <h3>Project teams: </h3>
          <ul>
            {formProject.teams.map(team => (
              <li key={team.teamId}>{team.teamName}</li>
            ))}
          </ul>
        </div>

        <div className='project-form-item'>
          <label htmlFor="newTeamId">
            Add team:
          </label>
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
          <button type="button" className='confirm-button' onClick={handleAddTeam}>Add Team</button>
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
            style={{ width: '60px', marginLeft: '10px' }}
          />
        </div>
        


        <div className='project-form-item'>
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

        {formProject.status.toLowerCase() !== 'not started' && (
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


        <div className='project-form-submit-buttons'>
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>

      </form>
    </div>
  );
};