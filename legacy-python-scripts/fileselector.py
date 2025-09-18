import os
import glob



all_files=glob.glob('/Users/michaelingram/Documents/GitHub/CA_lobby/Downloaded_files/*/*.csv')
files_to_process = [f for f in all_files  if not (os.path.basename(f).startswith("clean") or os.path.basename(f).startswith("project"))]

for filename in files_to_process:
    print(f"Select a file to process:{os.path.basename(filename)}")

