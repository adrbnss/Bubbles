# -*- coding: utf-8 -*-
"""
Created on Mon Jul 24 18:12:43 2023

@author: Adrien
"""

import openpyxl

def extract_column_as_list(file_path, sheet_name, column_index):
    try:
        # Load the workbook
        workbook = openpyxl.load_workbook(file_path)
        # Get the specific sheet by name
        sheet = workbook[sheet_name]
        
        # Initialize an empty list to store the values from the column
        column_data = []
        
        # Iterate through rows in the specified column
        for row in sheet.iter_rows(min_row=2, values_only=True, max_col=column_index, min_col=column_index):
            cell_value = row[0]
            # Append the value to the list
            column_data.append(cell_value)
        
        # Return the extracted column as a list
        return column_data
    
    except FileNotFoundError:
        print(f"File not found at path: {file_path}")
    except Exception as e:
        print(f"An error occurred: {e}")

# Usage example:
file_path = 'Plebian_Investor.xlsx' # Replace with the path to your Excel file
sheet_name = 'Sheet1'      # Replace with the name of the sheet containing the column
column_index = 1          # Replace with the index of the column you want (1 for A, 2 for B, etc.)

column_list = extract_column_as_list(file_path, sheet_name, column_index)
print(column_list)
