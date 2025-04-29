from enum import Enum

# time series data frequency
class DatetimeFrequency(str, Enum):
    # used for defining a future date range to match up with the current datetime frequency of the input data
    HOURLY = 'H'
    DAILY = 'D'

# class to define the input data format and the properties required to be forecasted on
class InputData():
    def __init__(self, forecast_col_name, datetime_col_name, id_col_name, features,
                 data_description, datetime_frequency: DatetimeFrequency, path=''):
        self.path = path
        self.forecast_col_name = forecast_col_name
        self.datetime_col_name = datetime_col_name
        self.id_col_name = id_col_name
        self.features = features
        self.data_description = data_description
        self.datetime_frequency = datetime_frequency
