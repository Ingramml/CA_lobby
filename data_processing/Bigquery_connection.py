from google.cloud import bigquery
from google.oauth2 import service_account
from google.api_core.exceptions import GoogleAPICallError, NotFound
from dotenv import load_dotenv
import os
import pandas as pd
import datetime

def bigquery_connect(credentials_path):
    try:
        # Load environment variables from .env file
        load_dotenv()

        # Define your variables
        project_id = get_project_id_from_credentials(credentials_path)

       # Load credentials
        credentials = service_account.Credentials.from_service_account_file(credentials_path)

        # Initialize BigQuery client
        client = bigquery.Client(credentials=credentials, project=project_id)

        # Test the connection by listing datasets
        datasets = client.list_datasets()
        print(f"✅ Successfully connected to BigQuery project: {project_id}")

        return client
    except Exception as e:
        print(f"❌ An error occurred while connecting to BigQuery: {e}")
        return None
    return
# Example usage



def get_project_id_from_credentials(credentials_path):
    """
    Extracts the project ID from the service account JSON credentials file.

    Args:
        credentials_path (str): Path to the service account JSON key file.

    Returns:
        str: The project ID.
    """
    try:
        # Load credentials
        credentials = service_account.Credentials.from_service_account_file(credentials_path)

        # Extract project ID
        project_id = credentials.project_id
        print(f"✅ Project ID: {project_id}")
        return project_id

    except FileNotFoundError:
        print(f"❌ Credentials file not found: {credentials_path}")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        return None





if __name__ == "__main__":
    """
    # Load environment variables from .env file
    load_dotenv()

    # Get the credentials path from the .env file
    credentials_path = os.getenv('CREDENTIALS_LOCATION')  # Path to your service account JSON file

    if not credentials_path:
        print("❌ CREDENTIALS_LOCATION is not set in the .env file.")
    else:
        try:
            # Extract the project ID from the credentials
            project_id = get_project_id_from_credentials(credentials_path)

            # Load credentials
            credentials = service_account.Credentials.from_service_account_file(credentials_path)

            # Initialize BigQuery client with explicit credentials
            client = bigquery.Client(credentials=credentials, project=project_id)

            # Test the connection by listing datasets
            datasets = list(client.list_datasets())
            print(f"✅ Successfully connected to BigQuery project: {project_id}")
            print(f"Available datasets: {[dataset.dataset_id for dataset in datasets]}")

        except Exception as e:
            print(f"❌ An error occurred while connecting to BigQuery: {e}")
        """