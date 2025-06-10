import axios from 'axios';
import { ProjectModel } from '../models/ProjectModel';
import { ProjectDetailedModel } from '../models/ProjectDetailedModel';

const baseUrl = 'http://localhost:8080/projects';

export const fetchUserProjects = async (employeeId: string): Promise<ProjectModel[]> => {
  const response = await axios.get<ProjectModel[]>(`${baseUrl}/employee/${employeeId}`);
  return response.data;
};

export const fetchUserDetailedProjects = async (employeeId: string): Promise<ProjectDetailedModel[]> => {
  const response = await axios.get<ProjectDetailedModel[]>(`${baseUrl}/detailed/employee/${employeeId}`);
  return response.data;
};

export const fetchDetailedProjectById = async (projectId: string): Promise<ProjectDetailedModel> => {
  const response = await axios.get<ProjectDetailedModel>(`${baseUrl}/detailed/${projectId}`);
  return response.data;
};

export const fetchUserProjectsByStatus = async (employeeId: string, status: string): Promise<ProjectDetailedModel[]> => {
  console.log("API - fetchUserProjectsByStatus");
  const response = await axios.get<ProjectDetailedModel[]>(`${baseUrl}/detailed/employee/${employeeId}/status/${status}`);
  return response.data;
};

export const updateProject = async (project: ProjectModel, projectId: string): Promise<ProjectModel> => {
  console.log("API - updateProject entered");
  const response = await axios.put<ProjectModel>(`${baseUrl}/${projectId}`, project);
  return response.data;
};




export const createProject = async (project: ProjectModel): Promise<ProjectModel> => {
  console.log("API - createProject entered");
  const response = await axios.post<ProjectModel>(`${baseUrl}`, project);
  return response.data;
};




export const addParticipant = async (projectId: string, participantId: string): Promise<void> => {
  await axios.post(`${baseUrl}/${projectId}/addParticipant/${participantId}`);
};

export const addTeam = async (projectId: string, teamId: string): Promise<void> => {
  await axios.post(`${baseUrl}/${projectId}/addTeam/${teamId}`);
};
