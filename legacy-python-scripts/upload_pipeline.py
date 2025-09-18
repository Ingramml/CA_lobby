from upload import upload_to_bigquery
from rowtypeforce import row_type_force
from Bigquery_connection import bigquery_connect
from load_dotenv import load_dotenv
import os
import pandas as pd
from datetime import datetime
import glob
from Bignewdownload_2 import Bignewdoanload


today= datetime.today().strftime('%Y-%m-%d')
download_dir = f"/Users/michaelingram/Documents/GitHub/CA_lobby/Downloaded_files/"
downloaded_files = Bignewdoanload(download_dir)
if downloaded_files:
    all_files = downloaded_files
else:
    all_files = glob.glob(f"{download_dir}/{today}/*.csv")
load_dotenv()
#all_files=glob.glob('/Users/michaelingram/Documents/GitHub/CA_lobby/Downloaded_files/*/*.csv')
files_to_process = [f for f in all_files  if not (os.path.basename(f).startswith("clean") or os.path.basename(f).startswith("project"))]
print(files_to_process)
client=bigquery_connect(os.getenv('CREDENTIALS_LOCATION'))

for filename in files_to_process:
    print(filename)
    
    inputfile=filename

    table_extract=os.path.basename(inputfile)
    # Extract the table name from the file name
    table_name1 = table_extract.split("_",1)[1][0:-4]
    print(table_name1)
    tablename = 'ca-lobby.ca_lobby.' + table_name1
    print(tablename)
    # Load environment variables from .env file
    # Load the credentials from the .env file

    cleanedframe=row_type_force(client, tablename, inputfile)
    # Upload the DataFrame to BigQuery
    project_id = "ca-lobby"  # Replace with your Google Cloud project ID
    upload_to_bigquery(cleanedframe,tablename, os.getenv('CREDENTIALS_LOCATION'),project_id)
client.close()
