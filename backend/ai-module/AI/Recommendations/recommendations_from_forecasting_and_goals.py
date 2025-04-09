import pandas as pd

# example script of how recommendations can be used to generate recommendations
# logic for generating these recommendations has been moved to the frontend

def get_recommendation(goal, attribute, weekly_prediction_values):
    #  rounding half up, works only for attributes where summing to get the total makes sense
    daily_extra_steps = int((goal - sum(weekly_prediction_values)) / 7) + 0.5
    if daily_extra_steps > 0:
        return f'Predicted {sum(weekly_prediction_values):.0f} total weekly {attribute}. Aim to increase {attribute} on a daily average by {daily_extra_steps:.0f} to reach the goal'
    else:
        return f'Predicted {sum(weekly_prediction_values):.0f} total weekly {attribute}. On track for weekly {attribute} goal'


# dummy values for now:
goals = {
    'steps': 70000,
    'sleep': 480,
    'calories': 2048,
    'intensity': 1050
}

# using example weekly predictions:
# (perhaps once done the predictions call this afterwards)
user_id = 109
next_week_steps_predictions = pd.read_csv(
    f'../forecasting/saved_predictions/user_{user_id}_steps_predictions_[2023-10-20 -> 2023-10-27].csv')['Prediction'].values
next_week_calories_predictions = pd.read_csv(
    f'../forecasting/saved_predictions/user_{user_id}_calories_value_predictions_[2023-10-20 -> 2023-10-27].csv')['Prediction'].values
next_week_sleep_predictions = pd.read_csv(
    f'../forecasting/saved_predictions/user_{user_id}_sleep_value_predictions_[2023-10-20 -> 2023-10-27].csv')['Prediction'].values
next_week_intensity_predictions = pd.read_csv(
    f'../forecasting/saved_predictions/user_{user_id}_intensity_predictions_[2023-10-19 -> 2023-10-26].csv')['Prediction'].values


steps_recommendation = get_recommendation(goals['steps'], 'steps', next_week_steps_predictions)
print(steps_recommendation)

calories_recommendation = get_recommendation(
    goals['calories'], 'calories', next_week_calories_predictions)
print(calories_recommendation)

sleep_recommendation = get_recommendation(goals['sleep'], 'sleep', next_week_sleep_predictions)
print(sleep_recommendation)

intensity_recommendation = get_recommendation(
    goals['intensity'], 'intensity', next_week_intensity_predictions)
print(intensity_recommendation)
