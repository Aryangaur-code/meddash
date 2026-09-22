import pandas as pd
import json

print("Loading Excel file...")
# Load only a subset to save RAM if possible, but we might need to read all.
try:
    df = pd.read_excel('MID.xlsx', nrows=50000) # Read first 50k rows to avoid massive RAM usage
except Exception as e:
    print(f"Error: {e}")
    exit(1)

# Ensure columns exist, fill nan with empty string
df = df.fillna('')
columns_to_keep = ['Name', 'Contains', 'ProductUses', 'ProductBenefits', 'SideEffect', 'HowWorks', 'SafetyAdvice']
existing_cols = [c for c in columns_to_keep if c in df.columns]

print(f"Found columns: {existing_cols}")

# Search for common drugs to populate a solid mock database
search_terms = ['telma', 'paracetamol', 'metformin', 'amlodipine', 'salbutamol', 'ibuprofen', 'azithromycin', 'omeprazole', 'crocin', 'dolo']

results = []
for index, row in df.iterrows():
    name = str(row.get('Name', '')).lower()
    if any(term in name for term in search_terms):
        med = {}
        for col in existing_cols:
            med[col] = str(row[col])
        results.append(med)
        if len(results) >= 200: # limit to 200 items for the mock
            break

print(f"Extracted {len(results)} records.")

with open('src/data/medications_db.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)

print("Saved to src/data/medications_db.json")
