const data = [
  {date: '2023-01-01', id: 1},
  {date: '2023-01-05', id: 2},
  {date: '2023-01-03', id: 3}
];
data.sort((a, b) => b.date.localeCompare(a.date));
console.log(data);
