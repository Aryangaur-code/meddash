const XLSX = require('xlsx');

try {
  console.log("Loading workbook...");
  const workbook = XLSX.readFile('MID.xlsx', { sheetRows: 50 });
  console.log("Sheet names:", workbook.SheetNames);
  
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`\n--- Sheet: ${sheetName} ---`);
    console.log("Rows found:", data.length);
    if (data.length > 0) {
      console.log(JSON.stringify(data.slice(0, 5), null, 2));
    }
  }
} catch (error) {
  console.error("Error reading file:", error.message);
}
