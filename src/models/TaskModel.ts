import { CategoryModel } from "./CategoryModel";

export interface TaskModel {
	taskId?: string
  title: string
  category?: CategoryModel
  description?: string
  createdById: string
  assignedToId?: string
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