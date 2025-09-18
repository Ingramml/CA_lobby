import os
import pandas as pd


def ensure_dataframe(input_data):
    """
    Ensures the input is a pandas DataFrame.
    If the input is a CSV file path, it reads the file into a DataFrame.
    If the input is already a DataFrame, it returns it as is.
    """
    if isinstance(input_data, pd.DataFrame):
        # Input is already a DataFrame
        return input_data
    elif isinstance(input_data, str):
        # Input is a string, check if it's a valid CSV file path
        if os.path.isfile(input_data) and input_data.lower().endswith('.csv'):
            # Read the CSV file into a DataFrame
            return pd.read_csv(input_data, low_memory=False)
        else:
            raise ValueError(f"Invalid file path or unsupported file type: {input_data}")
    else:
        raise TypeError("Input must be either a pandas DataFrame or a CSV file path.")

if __name__ == "__main__":
    """
    
    """    