import pandas as pd

try:
    print("Loading MID.xlsx...")
    df = pd.read_excel('MID.xlsx', usecols=[0]) # Only read the first column to save memory
    print("Total rows:", len(df))
except Exception as e:
    print("Error:", str(e))
