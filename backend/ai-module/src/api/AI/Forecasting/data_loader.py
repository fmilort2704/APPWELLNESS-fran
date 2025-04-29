import pandas as pd
from AI.Forecasting.input_data import DatetimeFrequency
from AI.Forecasting.config import TRAIN_SPLIT, FUTURE_PREDICTION_DURATION, FOLDER_PATH, PLOT
from AI.Forecasting.plot import plot_new_feature_box_plots, plot_train_test_split, plot_user_time_series_data
from sklearn.model_selection import train_test_split
from datetime import timedelta


def load_user_data(user_id, input_data_config, user_df=None):
    if user_df is None:
        df = pd.read_csv(FOLDER_PATH + input_data_config.path)
        user_df = df[df[input_data_config.id_col_name] == user_id]

    # filter and clean the dataframe
    user_df = user_df.set_index(input_data_config.datetime_col_name)
    user_df = user_df.sort_values(by=[input_data_config.datetime_col_name], ascending=True)
    user_df.index = pd.to_datetime(user_df.index, utc=True)
    if PLOT:
        plot_user_time_series_data(user_df, input_data_config.forecast_col_name, user_id, input_data_config.datetime_col_name)

    # create new datetime features to expose patterns in the data, (only FEATURE_COLS features will be used from config)
    feature_engineer(user_df)
    if PLOT:
        plot_new_feature_box_plots(user_df, input_data_config.features, input_data_config.forecast_col_name)

    return user_df


# create new datetime features to improve the models' performance at spotting time series patterns
def feature_engineer(df):
    df['hour'] = df.index.hour
    df['dayofyear'] = df.index.dayofyear
    df['dayofweek'] = df.index.dayofweek
    df['dayofmonth'] = df.index.day
    df['isweekend'] = df['dayofweek'] >= 5

# split the data into train, validation and test sets for testing the models performance on known results
def train_val_test_split(user_df, feature_cols, forecast_col_name):
    X = user_df[feature_cols]
    y = user_df[forecast_col_name]
    test_split = 1 - TRAIN_SPLIT
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_split, shuffle=False)
    # split train to get validation set
    val_split = test_split / TRAIN_SPLIT  # so that the val_size is equal to test_size
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=val_split, shuffle=False)

    plot_train_test_split(y_train, y_val, y_test, forecast_col_name)
    return X_train, y_train, X_val, y_val, X_test, y_test

# train the model on all the known data once tested to be run in deployment
def full_train_predict_future(user_df, start_future_date, last_future_date, feature_cols, forecast_col_name, datetime_frequency):
    train_data = user_df
    # split out features and targets
    X_all, y_all = train_data[feature_cols], train_data[forecast_col_name]
    #  get future dates for future predictions
    future_dates_df = get_future_dates_df(user_df, datetime_frequency, start_future_date, last_future_date)
    X_future = future_dates_df[feature_cols]
    return X_all, y_all, X_future

# calculate and add the future dates to be forecasted on into the dataframe
def get_future_dates_df(df, datetime_frequency, start_future_date=None, last_future_date=None):
    if not start_future_date:
        # if start_date is none then it takes the following date from the user's last recorded date
        if datetime_frequency == DatetimeFrequency.DAILY:
            start_future_date = df.index[-1] + timedelta(days=1)
        else:
            # if more datetime frequencies are added then this should be updated
            start_future_date = df.index[-1] + timedelta(hours=1)

    if not last_future_date:
        last_future_date = df.index[-1] + FUTURE_PREDICTION_DURATION

    future_dates = pd.date_range(
        start=start_future_date,
        end=last_future_date, freq=datetime_frequency)

    df = pd.DataFrame()
    df.index = future_dates
    feature_engineer(df)
    return df
