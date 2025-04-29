import numpy as np
import pandas as pd
from AI.Grouping.config import GROUP_COL_NAME
from AI.Grouping.input_datas import client, public, public_min_max_hr_intenstiy

# converts the clustering model results into a patient badge 
def get_badge_name(user_group_labels):
    # handle null case in which no records exist for user in this time period
    if user_group_labels.empty:
        return ""
    #  average the labels and round half-up
    average_label = int(np.mean(user_group_labels) + 0.5)
    # grouping should have sorted the labels by fitness, with higher label correlating with a higher fitness level
    return chr(average_label + 65)


def get_user_group(id, lower_datetime, grouped_data_path, id_col_name, datetime_col_name, upper_datetime=np.datetime64('today')):
    # get the groups of the user within a time period and average to get a final group
    try:
        df = pd.read_csv(grouped_data_path)
        user_labels = df[(df[id_col_name] == id) &
                         (df[datetime_col_name] > str(lower_datetime)) &
                         (df[datetime_col_name] <= str(upper_datetime))][GROUP_COL_NAME]
        return user_labels
    except FileNotFoundError:
        print('Error: File not found. \nNote: Run "groupy.py" first to load the grouped_data results and check "config.py" path is correct')


if __name__ == "__main__":
    # e.g. get the values for the last 7 days: (update for UI query)
    upper_datetime = np.datetime64('2023-10-18')
    lower_datetime = upper_datetime - np.timedelta64(7, 'D')
    user_id = 109.0

    data_to_group_on = client
    grouped_data_path = f'/AI/Grouping/grouped_data/grouped_{data_to_group_on.data_description}.csv'
    id_col_name = data_to_group_on.id_col_name
    datetime_col_name = data_to_group_on.datetime_col_name

    user_group_labels = get_user_group(
        id=user_id, lower_datetime=lower_datetime,  
        grouped_data_path = grouped_data_path, 
        id_col_name = id_col_name, 
        datetime_col_name = datetime_col_name,
        upper_datetime=upper_datetime)
    
    user_badge_name = get_badge_name(user_group_labels)

    print(f'User labels: \n{user_group_labels}')
    print(f'User badge name: {user_badge_name}')
