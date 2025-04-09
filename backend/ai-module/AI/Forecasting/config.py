import pandas as pd
from AI.Forecasting.input_data import InputData, DatetimeFrequency
from datetime import timedelta

# forecasting config file, update to change the core configurations for the forecasting models running

# model settings:
PLOT = False # set false for running via the api
Models = ['XGBoost', 'RandomForest']
MODEL = 'XGBoost'
# proportion of data used for training the model
TRAIN_SPLIT = 0.85


# time period to predict into the future
FUTURE_PREDICTION_DURATION = timedelta(weeks=1)


# setting constants from selected input data:
FOLDER_PATH = '../../data/'


# run a loaded model
LOAD_SAVED = False
# train, validate and test with available data
FORECAST_AND_VALIDATE = False # set false when running in production
# train on all available data and predict future values
FORECAST_FUTURE = True

SAVE_MODEL = False