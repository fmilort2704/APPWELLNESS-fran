import numpy as np

from flask import Flask, json, request, render_template
from flask_cors import CORS
from AI.Grouping.get_user_grouping import get_user_group, get_badge_name
from AI.Grouping.group import Group
from AI.Forecasting.data_loader import load_user_data
from AI.Forecasting.models.ensemble_model import EnembleModel
from AI.Forecasting.config import FOLDER_PATH
from AI.Grouping.input_data import InputData as GroupingInputData
from AI.Forecasting.input_data import DatetimeFrequency, InputData as ForecastingInputData
from AI.Grouping.grouping_with_shap import Group as GroupShap
import psycopg2
from urllib.parse import urlparse
import os
from dotenv import load_dotenv
import pandas.io.sql as psql
import pandas as pd


os.environ["LOKY_MAX_CPU_COUNT"] = "4"

# flask api to communicate the ai-module results with the React frontend
api = Flask(__name__)
CORS(api)

load_dotenv()

forecastData = {}

# currently testing grouping with an example id from the client's csv data
# this can be altered to be an id from the database, you'd need to query all datapoints of the current users
uid_test = 109

# runs the grouping model and returns the average group for the patient
@api.route("/flask/group", methods=["POST"])
def getGroup():
    request_data = request.get_json()
    uid = request_data["uid"]

    database_daily_data = GroupingInputData(
        path='client_data/cleaned/fitbit/cleaned_fitbit_grouped_dups.csv',
        data_description='client_fitbit_data',
        # (selected between 2 and 3 features to group on)
        features=['steps', 'intensity'],
        features_skew_lambdas=[0.13, -0.35],
        id_col_name='user/id',
        datetime_col_name='createdAt',  # also the option of using 'updatedAt'
    )

    group = Group(data_to_group_on = database_daily_data)
    group.cluster()

    grouped_data_path = f'AI/Grouping/grouped_data/grouped_{database_daily_data.data_description}.csv'

    # today = np.datetime64('today') # use today if linked to db
    today = np.datetime64('2023-10-18')


    user_group_labels = get_user_group(
        id=uid_test, lower_datetime=today - np.timedelta64(7, "D"),  
        upper_datetime=today,
        grouped_data_path = grouped_data_path, 
        id_col_name = database_daily_data.id_col_name, 
        datetime_col_name = database_daily_data.datetime_col_name)
    
    result = get_badge_name(user_group_labels)

    data = {
        "uid": uid,
        "data": result
    }

    return json.dumps(data), 201


# runs the grouping shap for a patient to get the explainations of the group to use in the dashboard badge popup
@api.route("/flask/group_shap", methods=["POST"])
def getGroupShap():
    request_data = request.get_json()
    uid = request_data["uid"]

    database_daily_data = GroupingInputData(
        path='client_data/cleaned/fitbit/cleaned_fitbit_grouped_dups.csv',
        data_description='client_fitbit_data',
        # (selected between 2 and 3 features to group on)
        features=['steps', 'intensity'],
        features_skew_lambdas=[0.13, -0.35],
        id_col_name='user/id',
        datetime_col_name='createdAt',  # also the option of using 'updatedAt'
    )

    group = GroupShap(data_to_group_on=database_daily_data)

    uid_test = 131
    exp = group.cluster(pat_id=uid_test)

    today = np.datetime64("2016-05-11") #???
    grouped_data_path = f'AI/Grouping/grouped_data/grouped_{database_daily_data.data_description}.csv'


    user_group_labels = get_user_group(
        id=uid_test, lower_datetime=today - np.timedelta64(7, "D"),  
        upper_datetime=today,
        grouped_data_path = grouped_data_path, 
        id_col_name = database_daily_data.id_col_name, 
        datetime_col_name = database_daily_data.datetime_col_name)
    

    result = get_badge_name(user_group_labels)

    # print(result)
    data = {"uid": uid_test, "data": result, "data": result, "expl": exp}

    return json.dumps(data), 201
    
# runs the forecasting model on the patient's data queried from the database
@api.route("/flask/forecast", methods=["POST"])
def getForecast():
    request_data = request.get_json()
    uid = request_data["uid"]
    data_category = request_data["data"]

    forecast_data_col = data_category.lower() 
    if forecast_data_col == 'sleep' or forecast_data_col == 'calories':
        forecast_data_col += '_value'
    

    database_daily_data = ForecastingInputData(
        forecast_col_name=forecast_data_col, 
        datetime_col_name='data_created_at',
        id_col_name='user_id',
        features=['dayofweek', 'dayofmonth', 'isweekend', 'dayofyear'],
        data_description='database daily data',
        datetime_frequency=DatetimeFrequency.DAILY,
    )


    user_df = get_data(user_id=uid)
    # load data and run some feature engineering to prepare the data for modelling
    user_df = load_user_data(uid, database_daily_data, user_df=user_df)
    
    model = EnembleModel(user_df, forecast_data_col, input_data_config=database_daily_data)
    predictions = model.forecast_future(last_future_date=None, start_future_date=None, load_saved_model=None)

    if forecast_data_col == 'sleep_value':
        # convert into hours for dashboard
        predictions = [int(x) / 60 for x in predictions["Prediction"]]
    else:
        predictions = predictions['Prediction'].values.tolist()

    # print(predictions)
    data = {
        "uid": uid,
        "data": predictions
        # "data": ["7000","8000","8500","8250","7000","7700","8000"]
    }
    return json.dumps(data), 201


# example of running the forecasting model on a public dataset with hourly values for testing further implementations
@api.route("/flask/forecast_public", methods=["POST"])
def getPublicForecast():
    request_data = request.get_json()
    uid = request_data["uid"]
    data_category = request_data["data"]
    forecast_data_col = data_category
    if forecast_data_col == "Intensity":
        forecast_data_col = "Total" + forecast_data_col
    elif forecast_data_col == "Steps":
        forecast_data_col = "StepTotal"
    elif forecast_data_col == "Sleep":
        forecast_data_col = "isAsleep"
    
    public_hourly_data = ForecastingInputData(
        path='public_data/cleaned/fitbit/cleaned_hourly.csv',
        forecast_col_name=forecast_data_col, 
        datetime_col_name='ActivityHour',
        id_col_name='Id',
        features=['hour', 'dayofweek', 'dayofmonth', 'isweekend'],
        data_description='public hourly data',
        datetime_frequency=DatetimeFrequency.HOURLY,
    )

    # selected public id from public dataset for demo of hourly predictions
    public_selected_id = 1503960366

    # load data and run some feature engineering to prepare the data for modelling
    user_df = load_user_data(public_selected_id, public_hourly_data)
    
    model = EnembleModel(user_df, forecast_data_col, input_data_config=public_hourly_data)
    predictions = model.forecast_future(last_future_date=None, start_future_date=None, load_saved_model=None)

    # print(predictions)

    data = {
        "uid": uid,
        "data": predictions["Prediction"].values.tolist()
    }
    return json.dumps(data), 201

def get_db_connection():
    database_url = os.getenv("DATABASE_URL", "postgres://udc9cc48v6715g:p2eb233a21695a433429a5df26e76ee06f2562f1e8408e8c695a6384f0c49f3c2@ec2-3-213-28-16.compute-1.amazonaws.com:5432/dbk5e5h1rui4i4")

    result = urlparse(database_url)

    conn = psycopg2.connect(
        host=result.hostname,
        database=result.path[1:],
        user=result.username,
        password=result.password,
        port=result.port,
        sslmode="require"
    )

    print(f"Connecting to database at host: {result.hostname}, database: {result.path[1:]}")

    return conn


# # connect to the postgres database
# def get_db_connection():
#     conn = psycopg2.connect(
#         host="cd1jo1mf6mehgh.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com",
#         database="d7tvo3v54rf20k",
#         user='u6606qv1cgspbr',
#         password='p94bca382b1144c2cff95d9ef9a65308369992c34a78e66632e21da3b11486f29',
#         )
    
#     return conn

# quiries the data from the database for running on the forecasting model
def get_data(user_id):
    conn = get_db_connection()
    fitbit_user_df = psql.read_sql_query(f'''
            SELECT 
                fddul.id AS link_id, 
                fddul.fitbit_daily_data_id, 
                fddul.user_id, 
                fddul.fitbit_daily_data_order, 
                fdd.sleep_target, 
                fdd.sleep_value, 
                fdd.steps, 
                fdd.calories_target, 
                fdd.calories_value, 
                fdd.intensity, 
                fdd.min_heart_rate, 
                fdd.max_heart_rate, 
                fdd.created_at AS data_created_at, 
                fdd.updated_at AS data_updated_at, 
                fdd.created_by_id AS data_created_by_id, 
                fdd.updated_by_id AS data_updated_by_id 
                FROM 
                    fitbit_daily_datas_user_links AS fddul 
                INNER JOIN 
                    fitbit_daily_datas AS fdd 
                ON 
                    fddul.fitbit_daily_data_id = fdd.id
                WHERE
                    fddul.user_id={user_id}
                ''', conn)
    
    # fitbit cleaning
    fitbit_user_df.loc[fitbit_user_df['sleep_target'] == '[object Object]', 'sleep_target'] = fitbit_user_df['sleep_target'].mode()[0]
    fitbit_user_df['sleep_target'].fillna(fitbit_user_df['sleep_target'].mode()[0], inplace=True)
    fitbit_user_df['sleep_target'] = fitbit_user_df['sleep_target'].astype(int)
    fitbit_user_df.loc[fitbit_user_df['sleep_value'] == '[object Object]', 'sleep_value'] = np.nan
    
    garmin_user_df = psql.read_sql_query(f'''
                SELECT
                    gdul.id AS link_id,
                    gdul.garmin_daily_data_id,
                    gdul.user_id,
                    gdul.garmin_daily_data_order,
                    gdd.sleep_target,
                    gdd.sleep_value,
                    gdd.steps,
                    gdd.calories_target,
                    gdd.calories_value,
                    gdd.intensity,
                    gdd.min_heart_rate,
                    gdd.max_heart_rate,
                    gdd.daily_step_goal,
                    gdd.created_at AS data_created_at,
                    gdd.updated_at AS data_updated_at,
                    gdd.created_by_id AS data_created_by_id,
                    gdd.updated_by_id AS data_updated_by_id
                FROM
                    garmin_daily_datas_user_links AS gdul
                INNER JOIN
                    garmin_daily_datas AS gdd
                ON
                    gdul.garmin_daily_data_id = gdd.id
                WHERE
                    gdul.user_id={user_id}
                ''', conn)
    
    conn.close()    
    user_ap_data = pd.concat([fitbit_user_df, garmin_user_df])
    
    return user_ap_data




if __name__ == "__main__":
    # api.run(port=5000, debug=True)
    api.run(port=5002)
