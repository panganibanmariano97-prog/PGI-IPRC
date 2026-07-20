const arr = [{date: '2026-06-18'}, {date: '2026-06-21'}];
arr.sort((a, b) => b.date.localeCompare(a.date));
console.log(arr);
