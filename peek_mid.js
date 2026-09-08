const XLSX = require('xlsx');

try {
  console.log("Loading workbook...");
  const workbook = XLSX.readFile('MID.xlsx', { sheetRows: 10 }); // only read first 10 rows
  console.log("Loaded workbook.");
  
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const data = XLSX.utils.sheet_to_json(worksheet);
  console.log("Headers & First 5 rows:");
  console.log(JSON.stringify(data.slice(0, 5), null, 2));
} catch (error) {
  console.error("Error reading file:", error.message);
}
