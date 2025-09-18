from google.cloud import bigquery
from google.oauth2 import service_account
from google.api_core.exceptions import GoogleAPICallError, NotFound
from dotenv import load_dotenv
import os
import pandas as pd
import datetime
from determine_df import ensure_dataframe

load_dotenv()



def upload_to_bigquery(inputfile, table_id, credentials_path, project_id):
    """
    Uploads a CSV file to a BigQuery table.

    Args:
        csv_file_path (str): Path to the CSV file to upload.
        table_id (str): The BigQuery table ID (e.g., "dataset.table_name").
        project_id (str): The Google Cloud project ID.
        credentials_path (str): Path to the service account JSON key file.

    Returns:
        None
    """
    try:
        # Load credentials
        credentials = service_account.Credentials.from_service_account_file(credentials_path)

        # Initialize BigQuery client
        client = bigquery.Client(credentials=credentials, project=project_id)

        # Read the CSV file into a Pandas DataFrame
        df = ensure_dataframe(inputfile)
        # Upload the DataFrame to BigQuery
        job = client.load_table_from_dataframe(df, table_id)

        # Wait for the job to complete
        job.result()

        print(f"✅ Successfully uploaded {inputfile} to {table_id}")

    except FileNotFoundError:
        print(f"❌ File not found: {inputfile}")
    except GoogleAPICallError as e:
        print(f"❌ Google API error: {e}")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
    return



if __name__ == "__main__":
    """
    # Load environment variables from .env file
    load_dotenv()
    # Define your variables
    inputfile = "/Users/michaelingram/Documents/GitHub/CA_lobby/Downloaded_files/2025-05-14/2025-05-14_cvr_registration_cd.csv"
    table_id = "ca-lobby.ca_lobby.cvr_registration"  # Replace with your BigQuery table ID
    project_id = "ca-lobby"  # Replace with your Google Cloud project ID
    credentials_path = os.getenv('CREDENTIALS_LOCATION')  # Replace with the path to your service account key
    # Call the function to upload the CSV file to BigQuery
    upload_to_bigquery(inputfile, table_id, credentials_path,project_id)
    """