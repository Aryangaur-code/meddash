import pandas as pd
import json

try:
    print("Loading MID.xlsx...")
    df = pd.read_excel('MID.xlsx', nrows=5)
    print("Columns:", df.columns.tolist())
    print("Data:", df.head().to_json(orient="records"))
except Exception as e:
    print("Error:", str(e))
