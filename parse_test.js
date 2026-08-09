const str = '8/1\t\t\t\t\t\t\t\t\t\tBAEK SEUNGHYUK\t3\t3\t\t스마트스토어\t"\t백승혁"\t8/1 shark+malum 07:30\t\t\t\t\t\t\t\t\t\t\t\t\td2ba37eb-dac1-4d7d-9617-b9c77ef58330\t\t';
const row = str.split('\t');
row.forEach((col, i) => console.log(`Col ${i}: ${col}`));
