import { Interval } from '../model';

export const intervals: Interval[] = [
  {
    id: 1,
    name: 'Навчальний рік',
  },
  {
    id: 2,
    name: '1 семестр',
  },
  {
    id: 3,
    name: '2 семестр',
  },
  {
    id: 4,
    name: 'Місяць',
    subelem: [
      {
        id: 1,
        name: 'Січень',
      },
      {
        id: 2,
        name: 'Лютий',
      },
      {
        id: 3,
        name: 'Березень',
      },
      {
        id: 4,
        name: 'Квітень',
      },
      {
        id: 5,
        name: 'Травень',
      },
      {
        id: 6,
        name: 'Червень',
      },
      {
        id: 9,
        name: 'Вересень',
      },
      {
        id: 10,
        name: 'Жовтень',
      },
      {
        id: 11,
        name: 'Листопад',
      },
      {
        id: 12,
        name: 'Грудень',
      },
    ],
  },
];
