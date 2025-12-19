export const RESERVATIONTIME = [
  {
    id: 1,
    time: "09:00",
  },
  {
    id: 2,
    time: "10:00",
  },
  {
    id: 3,
    time: "11:00",
  },
  {
    id: 4,
    time: "12:00",
  },
  {
    id: 5,
    time: "13:00",
  },
  {
    id: 6,
    time: "14:00",
  },
  {
    id: 7,
    time: "15:00",
  },
  {
    id: 8,
    time: "16:00",
  },
  {
    id: 9,
    time: "17:00",
  },
  {
    id: 10,
    time: "18:00",
  },
  {
    id: 11,
    time: "19:00",
  },
  {
    id: 12,
    time: "20:00",
  },
  {
    id: 13,
    time: "21:00",
  },
  {
    id: 14,
    time: "22:00",
  },
];

export const RESERVATIONTABLE = [
  {
    floor: "first-floor",
    tables: [
      {
        id: 1,
        table: "01",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "15:00 - 16:00",
          },
        ],
      },
      {
        id: 2,
        table: "02",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "19:00 - 20:00",
          },
        ],
      },
      {
        id: 3,
        table: "03",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "11:00 - 12:00",
          },
          {
            id: 2,
            name: "John Doe",
            person: "1",
            time: "17:00",
          },
        ],
      },
      {
        id: 4,
        table: "04",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "13:00 - 14:00",
          },
        ],
      },
      {
        id: 5,
        table: "05",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "17:00 - 18:00",
          },
        ],
      },
      {
        id: 6,
        table: "06",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "12:00 - 13:00",
          },
        ],
      },
      {
        id: 7,
        table: "07",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "14:00 - 15:00",
          },
          {
            id: 2,
            name: "John Doe",
            person: "1",
            time: "19:00 - 21:00",
          },
        ],
      },
      {
        id: 8,
        table: "08",
        reserve: [],
      },
    ],
  },
  {
    floor: "second-floor",
    tables: [
      {
        id: 1,
        table: "01",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "15:00",
          },
        ],
      },
      {
        id: 2,
        table: "02",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "21:00 - 22:00",
          },
        ],
      },
      {
        id: 3,
        table: "03",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "10:00 - 11:00",
          },
          {
            id: 2,
            name: "John Doe",
            person: "1",
            time: "17:00",
          },
        ],
      },
      {
        id: 4,
        table: "04",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "13:00 - 14:00",
          },
        ],
      },
      {
        id: 5,
        table: "05",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "17:00 - 18:00",
          },
        ],
      },
      {
        id: 6,
        table: "06",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "12:00 - 13:00",
          },
        ],
      },
      {
        id: 7,
        table: "07",
        reserve: [
          {
            id: 1,
            name: "John Doe",
            person: "1",
            time: "14:00 - 15:00",
          },
          {
            id: 2,
            name: "John Doe",
            person: "1",
            time: "19:00 - 21:00",
          },
        ],
      },
      {
        id: 8,
        table: "08",
        reserve: [],
      },
    ],
  },
];

export type ReservationTableType = {
  floor: string;
  tables: {
    id: number;
    table: string;
    reserve: {
      id: number;
      name: string;
      person: string | number;
      time: string;
    }[];
  }[];
};
