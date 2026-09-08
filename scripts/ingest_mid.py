import pandas as pd
import sqlite3
import os

db_path = 'mid.db'
excel_path = 'MID.xlsx'

print(f"Connecting to SQLite database at {db_path}...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Dropping existing table if it exists...")
cursor.execute('DROP TABLE IF EXISTS medications')

print(f"Reading {excel_path} (This may take a few minutes)...")
df = pd.read_excel(excel_path)

print("Cleaning data...")
# Convert NaN to None so it inserts as NULL in SQLite
df = df.where(pd.notnull(df), None)

print("Writing to SQLite database...")
df.to_sql('medications', conn, if_exists='replace', index=False)

print("Creating index on 'Name' column...")
cursor.execute('CREATE INDEX idx_medications_name ON medications("Name")')
conn.commit()
conn.close()

print("Successfully converted MID.xlsx to mid.db!")
