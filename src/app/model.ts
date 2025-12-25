import { Role } from './constants/role';

export type ApiResponse<K extends string, T> = {
  [P in K]: T;
} & {
  message: string;
};

export interface Department {
  id: number;
  name: string;
  faculty_id?: number;
  pivot?: Pivot;
  faculties?: Faculty;
}

export interface Semester {
  id: number;
  name: string;
}

export interface LessonKind {
  id: number;
  name: string;
}

export interface Record {
  id: number;
  user_faculty_id: number;
  user_department_id: number;
  user_id: number;
  discipline_id: number;
  topic_id: number;
  kind_id: number;
  hour: number;
  date: string;
  group_faculty: string;
  course_id: number;
  form_id: number;
  group: string; // for custom group input
  is_custom_group: boolean;
  created_at: string;
  updated_at: string;
  semester: number;
  group_name: string;
  faculties: Faculty;
  departments: Department;
  users?: User;
  disciplines?: Discipline;
  topics?: Topic;
  discipline_kinds?: LessonKind;
  courses?: Course;
  forms?: LearningForm;
}

export interface Interval {
  id: number;
  name: string;
  subelem?: Interval[];
}

export interface Report {
  type: number;
  name: string;
  role?: Role;
}

export interface Discipline {
  id: number;
  name: string;
  department_id: number;
  semester_id: number;
  users: User[];
  departments: Department;
  semesters: Semester;
  pivot: Pivot;
}

export interface Faculty {
  id: number;
  name: string;
}

export interface Pivot {
  user_id: number;
  department_id: number;
}

export interface Topic {
  id: number;
  name: string;
  discipline_id: number;
  disciplines: Discipline;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  email_verified_at: string | null;
  password: string;
  created_at: string;
  updated_at: string;
  departments: Department[];
  role?: Role;
}

export interface LearningForm {
  id: number;
  name: string;
}

export interface Faculty {
  id: number;
  name: string;
  departments: Department[];
}

export interface Course {
  id: number;
  name: string;
}

export interface Group {
  id: number;
  name: string;
  course_id: number;
  faculty_id: number;
  form_id: number;
  courses: Course;
  faculties: Faculty;
  forms: LearningForm;
}
