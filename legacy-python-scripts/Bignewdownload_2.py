import bln
import ssl
import certifi
import datetime
from bln import Client
from dotenv import load_dotenv
import os
import pandas as pd


def Bignewdoanload(output_dir):
    #ssl_context = ssl.create_default_context(cafile=certifi.where())
    today = datetime.date.today()
    work_dir = os.path.join(output_dir, str(today))
    if not os.path.exists(work_dir):
        os.makedirs(work_dir)
    
    # Load the .env file
    load_dotenv()
    #TODO add the API key to the .env file
    apiKey= os.getenv()
    client = Client(apiKey) #loads the client with the API key
    project_name='California campaign finance data'
    project_id ='UHJvamVjdDo2MDVjNzdiYS0wODI4LTRlOTEtOGM3OC03ZjA4NGI2ZDEwZWE='
    bln.pandas.register(pd) #registers the pandas extension


    file_names = [
    "cvr_lobby_disclosure_cd.csv",
    "cvr_registration_cd.csv",
    "latt_cd.csv",
    "latt_cd.csv",
    "lccm_cd.csv",
    "lemp_cd.csv",
    "lexp_cd.csv",
    "loth_cd.csv",
    "lpay_cd.csv",
    "filername_cd.csv"]
    
    fileList = []

    for names in file_names:
        downloaded_file = os.path.join(work_dir, f"{today}_{names}")
        if os.path.exists(downloaded_file):
            print(f"File {downloaded_file} already exists. Skipping download.")
            continue
        print(f"Downloading {names} to {downloaded_file}")
        df = pd.read_bln(project_id, names, apiKey, low_memory=False)
        df.to_csv(downloaded_file, index=False)
        fileList.append(downloaded_file)

    return fileList



if __name__ == "__main__":
    output_dir = '/Users/michaelingram/Documents/GitHub/CA_lobby/Downloaded_files'
    Bignewdoanload(output_dir)
    #print(project_df)
    #print(project_df['updated_at'])
    #print(project_df['name'])
    #print(project_df['id'])
    #print(project_df['file_type'])
    #print(project_df['size'])
    #print(project_df['download_url'])
