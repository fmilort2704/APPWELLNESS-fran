import xgboost as xgb
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from AI.Forecasting.config import MODEL, FOLDER_PATH, PLOT, SAVE_MODEL
from AI.Forecasting.data_loader import full_train_predict_future, train_val_test_split
from AI.Forecasting.plot import plot_feature_importances, plot_full_truth_and_predictions, plot_truth_and_predictions
from joblib import dump, load

# XGBoost or Random Forest time series forecasting model
class EnembleModel:
    def __init__(self, user_df, user_id, input_data_config):
        self.forecast_col_name = input_data_config.forecast_col_name
        self.datetime_col_name = input_data_config.datetime_col_name
        self.feature_cols = input_data_config.features
        self.id_col_name = input_data_config.id_col_name
        self.data_description = input_data_config.data_description
        self.datetime_frequency=input_data_config.datetime_frequency
        self.user_id = user_id
        self.root_project_path = '../../'

        # filter out null values for forecasting column
        self.user_df = user_df[~user_df[self.forecast_col_name].isna()]

    def forecast(self):
        self.X_train, self.y_train, self.X_val, self.y_val, self.X_test, self.y_test = train_val_test_split(
            self.user_df, self.feature_cols, self.forecast_col_name)

        self.model = self.get_model(
            eval_set=[(self.X_train, self.y_train),
                      (self.X_val, self.y_val)])

        self.feature_importance()
        predictions = self.model.predict(self.X_test)
        rmse, nrmsd = self.evaluate(predictions)
        self.display_predictions(predictions, rmse, nrmsd)

    def forecast_future(
            self, start_future_date, last_future_date, load_saved_model,
            show_feature_importance=False):
        # X_train and y_train contain all training data
        self.X_train, self.y_train, self.X_future = full_train_predict_future(
            self.user_df, start_future_date, last_future_date, self.feature_cols, self.forecast_col_name, self.datetime_frequency)

        # set n_estimators to where early stopped from forecasting with validation set
        self.model = self.get_model(
            eval_set=[(self.X_train, self.y_train)],
            n_estimators=400, load_saved_model=load_saved_model)

        if show_feature_importance:
            self.feature_importance()
        predictions = self.model.predict(self.X_future)
        predictions_df = pd.DataFrame({'Prediction': predictions}, index=self.X_future.index)
        # save predictions:
        predictions_df.index.name = 'Future Date'
        if SAVE_MODEL:
            predictions_df.to_csv(self.root_project_path + f'AI/Forecasting/saved_predictions/user_{self.user_id}_{self.forecast_col_name}_predictions_[{predictions_df.index[0].strftime("%Y-%m-%d")} -- {predictions_df.index[-1].strftime("%Y-%m-%d")}].csv')
        
        
        # combine datasets
        train_df = pd.concat([self.X_train, self.y_train], axis=1)
        prediction_df = pd.concat([self.X_future, predictions_df], axis=1)
        train_and_prediction_df = pd.concat([train_df, prediction_df])
        if PLOT:
            plot_full_truth_and_predictions(train_and_prediction_df, is_future=True)
        return prediction_df

    def get_model(self, eval_set, n_estimators=1000, load_saved_model=False):
        saved_model_file_name = self.root_project_path + f'AI/Forecasting/saved_trained_models/{MODEL}_{self.data_description}_saved_model'
        # fit, test and evaulate the model, either using xgboost or random forest
        if MODEL == 'XGBoost':
            if load_saved_model:
                model = xgb.XGBRegressor()
                model.load_model(saved_model_file_name + '.json')
            else:
                # using early stopping to reduce overfitting
                model = xgb.XGBRegressor(
                    learning_rate=0.01, n_estimators=n_estimators, early_stopping_rounds=50,
                    max_depth=5)
                model.fit(
                    self.X_train, self.y_train,
                    eval_set=eval_set,
                    verbose=100)
                if SAVE_MODEL:
                    model.save_model(saved_model_file_name + '.json')
        else:  # otherwise using random forest
            if load_saved_model:
                model = load(saved_model_file_name + '.joblib')
            else:
                model = RandomForestRegressor(n_estimators=100, max_depth=3, random_state=0)
                model.fit(self.X_train, self.y_train)
                # save model
                if SAVE_MODEL:
                    dump(model, saved_model_file_name + '.joblib')

        return model

    def feature_importance(self):
        feature_importances = pd.DataFrame(data=self.model.feature_importances_,
                                           index=self.model.feature_names_in_,
                                           columns=['Feature Importance'])
        plot_feature_importances(feature_importances)

    def display_predictions(self, predictions, rmse, nrmsd):
        test_data = pd.concat([self.X_test, self.y_test], axis=1)
        test_data['Prediction'] = predictions

        # combine the predictions and full raw data together and plot
        user_preds_full_df = self.user_df.merge(
            test_data[['Prediction']],
            how='left', left_index=True, right_index=True)
        plot_full_truth_and_predictions(user_preds_full_df, self.forecast_col_name, self.user_id)

        # combine the intersection of predictions and raw data together and plot
        user_preds_df = self.user_df.merge(
            test_data[['Prediction']],
            how='right', left_index=True, right_index=True)
        plot_truth_and_predictions(user_preds_df, rmse, nrmsd, self.forecast_col_name, self.user_id)

    def evaluate(self, predictions):
        rmse = np.sqrt(mean_squared_error(self.y_test, predictions))
        print(f'RMSE on Test dataset: {rmse:0.2f}')

        # Note: better for comparing against models with different scales:
        nrmsd = rmse / (max(self.y_test) - min(self.y_test))
        print(f'Normalized Root-Mean-Square Deviation : {nrmsd:0.2f}')

        return rmse, nrmsd
