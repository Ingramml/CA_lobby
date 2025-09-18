import pandas as pd
import os
import datetime
from Bigquery_connection import bigquery_connect
from dotenv import load_dotenv
from determine_df import ensure_dataframe





def row_type_force(client,tablename,inputfile):
    """
    Forces the row type of a DataFrame to match the schema of a BigQuery table.

    Args:
        df (pd.DataFrame): The DataFrame to be forced.
        tablename (str): The name of the BigQuery table.

    Returns:
        pd.DataFrame: The DataFrame with forced row types.
    """
    # Get the schema of the BigQuery table

    df = ensure_dataframe(inputfile)
    working_dir = os.path.dirname(inputfile)
    filename = os.path.basename(inputfile)


    table = client.get_table(tablename)
    schema = table.schema

    # Iterate over the schema to get column names and types
    type_map = {}
    for field in schema:
        column_name = field.name
        column_type = field.field_type
        type_map[column_name] = column_type
        #print(f"BigQuery Column: {field.name}, Type: {field.field_type}")
        if column_type == 'STRING':
            df[column_name] = df[column_name].astype(str)
        elif column_type == 'INTEGER':
            df[column_name] = pd.to_numeric(df[column_name], errors='coerce').astype('Int64')
        elif column_type == 'FLOAT':
            df[column_name] = pd.to_numeric(df[column_name], errors='coerce').astype('float64')
        elif column_type == 'BOOLEAN':
            df[column_name] = df[column_name].astype(bool)
        elif column_type == 'TIMESTAMP':
            df[column_name] = pd.to_datetime(df[column_name], errors='coerce')
        elif column_type == 'DATE':
            df[column_name] = pd.to_datetime(df[column_name], errors='coerce').dt.date
        elif column_type == 'DATETIME':
            df[column_name] = pd.to_datetime(df[column_name], errors='coerce')
        elif column_type == 'TIME':
            df[column_name] = pd.to_datetime(df[column_name], errors='coerce').dt.time
        elif column_type == 'BYTES':
            df[column_name] = df[column_name].apply(lambda x: x.encode() if isinstance(x, str) else x)
    cleanedfile= os.path.join(working_dir, f"cleaned_{filename}")
    df.to_csv(cleanedfile,index=False)

    return df


if __name__ == "__main__":
    """
    #inputfile='/Users/michaelingram/Documents/GitHub/CA_lobby/Downloaded_files/2025-05-14/2025-05-14_cvr_registration_cd.csv'
    # Load environment variables from .env file
    load_dotenv()
    # Define your variables
    credentials_path = os.getenv('CREDENTIALS_LOCATION')  # Replace with the path to your service account key
    project_id = os.getenv('PROJECT_ID')  # Replace with your Google Cloud project ID
    client = bigquery_connect(credentials_path)
    tablename = 'ca-lobby.ca_lobby.cvr_registration'
    row_type_force()
    """