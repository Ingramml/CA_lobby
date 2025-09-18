from google.cloud import bigquery
from Bigquery_connection import bigquery_connect
from dotenv import load_dotenv
import os
load_dotenv()

    # Get the credentials path from the .env file
credentials_path = os.getenv('CREDENTIALS_LOCATION')  # 

client = bigquery_connect(credentials_path)

project = "ca-lobby"
dataset = "ca_lobby"
old_table = "latt_cd_copy"
new_table = "latt_cd"

table_ref = f"{project}.{dataset}.{old_table}"
new_table_ref = f"{project}.{dataset}.{new_table}"

# Fetch table schema
table = client.get_table(table_ref)
schema = table.schema

# Generate column mappings
column_exprs = []
new_column_names = []

for field in schema:
    original_name = field.name
    clean_name = original_name.replace(" text", "")
    column_exprs.append(f"`{original_name}` AS `{clean_name}`")
    new_column_names.append(clean_name)

select_clause = ",\n  ".join(column_exprs)

# Build and run the query
query = f"""
CREATE OR REPLACE TABLE `{new_table_ref}` AS
SELECT
  {select_clause}
FROM `{table_ref}`
"""

print("Running query to create table with cleaned column names...")
client.query(query).result()
print(f"✅ Created `{new_table}")
