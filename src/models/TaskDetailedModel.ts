import { CategoryModel } from "./CategoryModel";
import { EmployeeNameAndImageModel } from "./EmployeeNameAndImageModel";

export interface TaskDetailedModel {
	taskId?: string
  title: string
  category?: CategoryModel
  description?: string

  assignedToEmployee?: EmployeeNameAndImageModel
  
  createdByEmployee: EmployeeNameAndImageModel

  status: string
  priority: string
  projectId?: string

  createdDate?: Date | null
  assignedDate?: Date | null
  unassignedDate?: Date  | null
  doneDate?: Date | null

  timeStart?: Date | null
  timeEnd?: Date | null
}