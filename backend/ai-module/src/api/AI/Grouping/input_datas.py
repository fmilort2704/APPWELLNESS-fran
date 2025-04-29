
from AI.Grouping.input_data import InputData

# input data examples to be grouped on, including public and client data to test out different possibilites with further data availability
client = InputData(
    path='client_data/cleaned/fitbit/cleaned_fitbit_grouped_dups.csv',
    data_description='client_fitbit_data',
    # (selected between 2 and 3 features to group on)
    features=['steps', 'intensity'],
    features_skew_lambdas=[0.13, -0.35],
    id_col_name='user/id',
    datetime_col_name='createdAt',  # also the option of using 'updatedAt'
)

public = InputData(
    path='public_data/cleaned/fitbit/cleaned_daily_activity.csv',
    data_description='public_fitbit_data',
    # (selected between 2 and 3 features to group on)
    features=['TotalSteps', 'TotalActivityMinutes'],
    features_skew_lambdas=[0.65, 0.8],
    id_col_name='Id',
    datetime_col_name='ActivityDate',
)

# (Run hr_min_max_cleaning.ipynb cleaning script first)
public_min_max_hr_intenstiy = InputData(
    path='public_data/cleaned/fitbit/cleaned_daily_min_max_intensity.csv',
    data_description='public_fitbit_hr_data',
    # (selected between 2 and 3 features to group on)
    features=['Min Hr', 'Max Hr', 'Daily Total Intensity'],
    features_skew_lambdas=[-0.1, 0.3, 0.93],
    id_col_name='Id',
    datetime_col_name='ActivityDay',
)
