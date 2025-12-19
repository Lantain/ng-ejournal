import { Role } from './role';
import { Report } from '../model';

export const reports: Report[] = [
  {
    type: 1,
    name: 'Журнал навантаження',
  },
  {
    type: 2,
    name: 'За кафедрою',
    role: Role.department,
  },
];
