import { PriorityCircle } from '../../components/common/PriorityCircle';
import { TaskDetailedModel } from '../../models/TaskDetailedModel';
import './TaskDescription.scss'

interface TaskDescriptionProps {
  task: TaskDetailedModel;
  onClick: () => void; 
}

export function TaskDescription ({ task, onClick }: TaskDescriptionProps) {
  const isAssigned = task.assignedToEmployee;

  const getShortDescription = (description: string | undefined) => {
    if (!description) return "";
    return description.length > 40 ? description.slice(0, 40) + '...' : description;
  };

  return (
    <div className='task-item' onClick={onClick}>

      <div className='task-title-box'>

        <div className='task-title-text'>
          <p className='task-medium-text'>{task.title}</p>
        </div>

        <div className='task-title-priority'>
          <PriorityCircle priority={task.priority} />
        </div>

      </div>

      <p className="task-small-font margin-bottom-10">
        {getShortDescription(task.description)}
      </p>
      <p className='task-small-font'>
         <span className='text-font-weight-500'>Assigned to: </span>{isAssigned ? `${task.assignedToEmployee?.firstName ?? ''} ${task.assignedToEmployee?.lastName ?? ''}`.trim() : 'none'}
      </p>
      <p className='task-small-font'>
      <span className='text-font-weight-500'>Created by: </span>{task.createdByEmployee.firstName} {task.createdByEmployee.lastName}
      </p>
    </div>
  );
};