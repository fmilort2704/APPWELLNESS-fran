from AI.Forecasting.input_data import InputData
from AI.Forecasting.input_data import DatetimeFrequency

# input data examples that can be forecasted and tested on using both client and public datasets

public_daily = InputData(
    path='public_data/cleaned/fitbit/cleaned_daily_activity.csv',
    forecast_col_name='TotalSteps',
    datetime_col_name='ActivityDate',
    id_col_name='Id',
    features=['dayofweek', 'dayofmonth', 'isweekend', 'dayofyear'],
    data_description='public_daily_fitbit',
    datetime_frequency=DatetimeFrequency.DAILY,
    # # for sleep:
    # path='public_data/cleaned/fitbit/cleaned_sleep.csv',
    # forecast_col_name='TotalMinutesAsleep',
    # datetime_col_name='SleepDay',

    # # for heart rate:
    # path='public_data/cleaned/fitbit/cleaned_daily_hr.csv',
    # forecast_col_name='Max Daily Hr',  # 'Max Daily Hr', 'Min Daily Hr'
    # datetime_col_name='Time',
)

public_hourly = InputData(
    path='public_data/cleaned/fitbit/cleaned_hourly.csv',
    # 'StepTotal' #'TotalIntensity', 'AverageIntensity', 'Calories'
    forecast_col_name='Calories',
    datetime_col_name='ActivityHour',
    id_col_name='Id',
    features=['hour', 'dayofweek', 'dayofmonth', 'isweekend'],
    data_description='public_hourly_fitbit',
    datetime_frequency=DatetimeFrequency.HOURLY,
)

client_daily = InputData(
    path='client_data/cleaned/fitbit/cleaned_fitbit_grouped_dups.csv',
    # 'steps', 'calories_value', 'max_heart_rate', 'min_heart_rate', 'sleep_value', 'intensity' (limited datapoints)
    forecast_col_name='steps',
    datetime_col_name='createdAt',
    id_col_name='user/id',
    features=['dayofweek', 'dayofmonth', 'isweekend', 'dayofyear'],
    data_description='client_daily_fitbit',
    datetime_frequency=DatetimeFrequency.DAILY,
)
