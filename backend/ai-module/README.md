# GDP15ActivePoints_AI

## Requirements:

- Python 3.10
- Pandas 2.1.2
- Numpy 1.26.1
- Matplotlib 3.7.2
- Jinja2 3.1.2
- Seaborn 0.12.2
- Psycopg2 2.9.9
- Shap 0.44.0
- Xgboost 1.7.3

## Datasets:

- Client datasets (place in directories: /data/client_data/raw/fitbit\garmin)
- https://zenodo.org/records/53894#.YdMLrRPP3eo (Fitbit) (place in directories /data/public_data/raw/fitbit\garmin)
- https://data.world/jarnoma/activity-history (Garmin)

## Setup:

- Download the datasets and place into the data folder to run the code
- Place client datasets into a `/data/Client_Data/` folder
- Run the notebook scripts in `/public_datasets_exploration/` folder to produce cleaned output data, making sure to match the paths found in the /data_clean_and_exploration/. View the output graphs of the data exploration notebooks to gain a greater understanding on the data within the datasets
- Run `pip install .` in /ai-module/ directory to install the AI module for running
- Update `/src/api/apiInterface.py` to change the AI communication with the React app
