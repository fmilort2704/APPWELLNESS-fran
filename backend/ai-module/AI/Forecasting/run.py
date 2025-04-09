import pandas as pd
from models.ensemble_model import EnembleModel
from config import MODEL, FORECAST_AND_VALIDATE, LOAD_SAVED, FORECAST_FUTURE, FOLDER_PATH
from data_loader import load_user_data
from input_datas import client_daily, public_daily, public_hourly

# file to run the forecasting given the correctly configured config file

# configuration variables example
input_data_config = client_daily #public_hourly
selected_user_id = 109 #2347167796

save_loaded_data_path = f'loaded_data/{MODEL}_{input_data_config.data_description}_loaded_data.csv'

if LOAD_SAVED:
    user_df = pd.read_csv(save_loaded_data_path, index_col=0)
    user_df.index = pd.to_datetime(user_df.index, utc=True)
else:
    user_df = load_user_data(selected_user_id, input_data_config)
    user_df.to_csv(save_loaded_data_path)

model = EnembleModel(user_df, selected_user_id, input_data_config)

if FORECAST_AND_VALIDATE:
    # train, validate and test the forecasting model
    model.forecast()

if FORECAST_FUTURE:
    # train the model on all collected data from config path and predict future values
    # if load_saved_model then forecast on previously trained saved model, otherwise train on current collected data from config
    # set last_future_date to None to use FUTURE_PREDICTION_DURATION from config to calculate this
    # set start_future_date to None to set start_future_date as the next date after last available data as default
    predictions = model.forecast_future(start_future_date=None, last_future_date=None,
                                        load_saved_model=LOAD_SAVED)

    # print(predictions)
