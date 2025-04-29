import matplotlib.pyplot as plt
import seaborn as sns

from AI.Forecasting.config import PLOT, MODEL


def plot_user_time_series_data(user_df, forecast_col_name, user_id, datetime_col_name):
    user_df[[forecast_col_name]].plot(figsize=(16, 8))
    plt.title(f'(User {user_id}) {forecast_col_name} vs {datetime_col_name}')
    plt.xlabel(datetime_col_name)
    plt.ylabel(forecast_col_name)
    plot()

# show the feature engineered feature box plots to spot patterns in the data on these new features
def plot_new_feature_box_plots(user_df, feature_cols, forecast_col_name):
    if PLOT:
        for feature in feature_cols:
            fig, ax = plt.subplots(figsize=(12, 8))
            sns.boxplot(data=user_df, x=f'{feature}', y=forecast_col_name)
            ax.set_title(f'{forecast_col_name} by {feature}')
            plot()


def plot_train_test_split(y_train, y_val, y_test, forecast_col_name):
    fig, ax = plt.subplots(figsize=(16, 8))
    y_train.plot(ax=ax, label='Train data')
    y_val.plot(ax=ax, label='Validation data', c='g')
    y_test.plot(ax=ax, label='Test data')
    ax.legend(['Train data', 'Validation data', 'Test data'])

    plt.ylabel(forecast_col_name)
    plt.title('Train test split')
    plot()


def plot_feature_importances(feature_importances):
    feature_importances.sort_values('Feature Importance').plot(kind='barh')
    plt.title('Feature Importances')
    plot()


def plot_full_truth_and_predictions(user_preds_full_df, forecast_col_name, user_id, is_future=False):
    # plot both true value and prediction lines
    ax = user_preds_full_df[[forecast_col_name]].plot(figsize=(16, 8))
    user_preds_full_df['Prediction'].plot(ax=ax)

    plt.title(f'{forecast_col_name} values against predictions (for user: {user_id})')
    plt.ylabel(forecast_col_name)
    plt.legend(['True Values', f'{"Future " if is_future else ""}Prediction'])
    plot()


def plot_truth_and_predictions(user_preds_df, rmse, nrmsd, forecast_col_name, user_id):
    # plot both true value and prediction lines
    ax = user_preds_df[[forecast_col_name]].plot(figsize=(16, 8))
    user_preds_df['Prediction'].plot(ax=ax)

    plt.title(
        f'{forecast_col_name} predictions, user: {user_id}, RMSE: {rmse:0.2f}, NRMSD: {nrmsd:0.2f}')
    plt.ylabel(forecast_col_name)
    plt.legend(['True Values', 'Prediction'])
    
    save_path = f'prediction_plots/{MODEL}_{user_id}_{forecast_col_name}_predictions.png'
    save_plot(save_path)


def save_plot(save_path):
    plt.savefig(save_path)
    plot()


def plot():
    if PLOT:
        plt.show()
        plt.close()
