import pickle
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer
from sklearn.compose import ColumnTransformer
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from AI.Grouping.config import PLOT, NUM_GROUPS, MODEL, RUN_SAVED_MODEL, GROUP_COL_NAME, DATA_FOLDER, SAVE_MODEL
from AI.Grouping.plot import plot_unskew_transformation, plot_scaling, plot_kmeans
from AI.Grouping.input_datas import client, public, public_min_max_hr_intenstiy
class Group():
    def __init__(self, data_to_group_on):
        self.group_features = data_to_group_on.features
        self.features_skew_lambdas = data_to_group_on.features_skew_lambdas
        self.id_col_name = data_to_group_on.id_col_name
        self.data_path = DATA_FOLDER + data_to_group_on.path
        self.datetime_col_name = data_to_group_on.datetime_col_name
        self.data_description = data_to_group_on.data_description
        self.grouped_data_path = f'AI/Grouping/grouped_data/grouped_{data_to_group_on.data_description}.csv'
            
        self.df = self.load_data()
        self.model = KMeans(n_clusters=NUM_GROUPS, random_state=0)
        # pipeline for the data to run through from data preparation to modelling
        self.pipe = Pipeline([
            ('unskew_transformation', FunctionTransformer(self.unskew_transformation)),
            ('scaler', FunctionTransformer(self.feature_scaler)),
            ('model', self.model),
        ])

    def load_data(self):
        df = pd.read_csv(self.data_path)
        # remove nan values for the grouping features
        df = df.dropna(subset=self.group_features)

        df[self.datetime_col_name] = pd.to_datetime(df[self.datetime_col_name], utc=True)
        return df

    def box_cox_transformation(self, feature, l, df):
        transform = ColumnTransformer(
            transformers=[("box-cox", FunctionTransformer(lambda X: stats.boxcox(X, lmbda=l)), [feature])])
        return transform.fit_transform(df)

    # used in aim to update the feature distributions to normal distributions that will help with the clustering 
    def unskew_transformation(self, df):
        skewed_df = df.copy()
        for feature, skew_lambda in zip(self.group_features, self.features_skew_lambdas):
            df[feature] = self.box_cox_transformation(
                feature=feature, l=skew_lambda, df=df)
        if PLOT:
            plot_unskew_transformation(skewed_df, df, self.group_features)
        return df

    # scale the features to prevent the model being biased to features with larger scales than others
    def feature_scaler(self, df):
        scaler = StandardScaler()
        df[self.group_features] = scaler.fit_transform(
            df[self.group_features])
        if PLOT:
            plot_scaling(df, self.group_features)
        return df[self.group_features]

    def cluster(self, new_datapoints_df=pd.DataFrame()):
        saved_model_path = f'AI/Grouping/saved_trained_models/{MODEL}_{self.data_description}_saved_model.pk'
        if not new_datapoints_df.empty:
            # open saved model, and directly make the prediction with new data
            with open('./' + saved_model_path, 'rb') as f:
                loaded_model = pickle.load(f)

            new_datapoints_df = new_datapoints_df.set_index(self.datetime_col_name)
            kmeans_labels = loaded_model.predict(new_datapoints_df)
            loaded_group_centers = loaded_model['model'].cluster_centers_
            sorted_labels = self.sort_cluster_labels(
                kmeans_labels, loaded_group_centers=loaded_group_centers)

            new_datapoints_df[GROUP_COL_NAME] = sorted_labels
            new_datapoints_df = new_datapoints_df.reset_index()
            print(new_datapoints_df.head())
            # save results to be queried via get_user_grouping
            saved_df = pd.read_csv(self.grouped_data_path)
            pd.concat(
                [saved_df,
                 new_datapoints_df
                 [[self.id_col_name, self.datetime_col_name, GROUP_COL_NAME] + self.group_features]]).to_csv(
                self.grouped_data_path, index=False)
            # plot new data points on loaded model
            if PLOT:
                plot_kmeans(sorted_labels, new_datapoints_df, self.grouped_data_path,
                            self.datetime_col_name,
                            self.group_features,
                            loaded_model=True)
        else:
            kmeans_labels = self.pipe.fit_predict(self.df)
            # save model to allow for loading it later
            if SAVE_MODEL:
                with open('./'+saved_model_path, 'wb') as file:
                    pickle.dump(self.pipe, file)
            sorted_labels = self.sort_cluster_labels(kmeans_labels)
            self.df[GROUP_COL_NAME] = sorted_labels
            # save results to be queried via get_user_grouping
            self.df[[self.id_col_name, self.datetime_col_name,
                     GROUP_COL_NAME] + self.group_features].to_csv(self.grouped_data_path, index=False)
            if PLOT:
                plot_kmeans(sorted_labels, self.df, self.grouped_data_path,
                            self.datetime_col_name,
                            self.group_features)

    # sort the clusters into meaningful labels that can be used in the dashboard
    def sort_cluster_labels(self, kmeans_labels, loaded_group_centers=[]):
        # sort labels by average of the two clustering features, where lowest label is highest average fitness score
        group_centers = self.pipe['model'].cluster_centers_ if len(
            loaded_group_centers) == 0 else loaded_group_centers

        # {kmeans_label : group_center}
        group_centers_dict = dict(zip(range(NUM_GROUPS), list(group_centers)))
        group_centers = group_centers.tolist()  # (must be separate from sort)
        group_centers.sort(key=lambda l: (l[0] + l[1]) / 2, reverse=True)
        # {(group_center) : sorted_label}
        sorted_centers_dict = {tuple(c): i for i, c in enumerate(group_centers)}
        # get sorted_labels using kmeans labels
        sorted_labels = [sorted_centers_dict[tuple(group_centers_dict[l])] for l in kmeans_labels]
        return sorted_labels


if __name__ == "__main__":
    # cluster the data from the config file into groups and save results in csv file
    group = Group(data_to_group_on=client)

    if RUN_SAVED_MODEL:
        # cluster new datapoints without running a new model by loading a saved model (if exists):
        # e.g.: (if using TWO features to group on)
        if len(group.group_features) == 2:
            new_datapoints = pd.DataFrame(
                {group.id_col_name: [109, 109, 109],
                 group.group_features[0]: [44, 30, 20],
                 group.group_features[1]: [9000, 6000, 4000],
                 group.datetime_col_name: pd.to_datetime(
                    ['2023-10-20', '2023-10-21', '2023-10-22'],
                    utc=True)})
        # example for grouping on 3 features:
        elif len(group.group_features) == 3:
            new_datapoints = pd.DataFrame(
                {group.id_col_name: [109, 109, 109],
                 group.group_features[0]: [44, 30, 20],
                 group.group_features[1]: [9000, 6000, 4000],
                 group.group_features[2]: [340, 440, 220],
                 group.datetime_col_name: pd.to_datetime(
                    ['2023-10-20', '2023-10-21', '2023-10-22'],
                    utc=True)})
        else:
            print('Error: grouping on 1 or more than 3 features is not supported')
        group.cluster(new_datapoints_df=new_datapoints)

    else:
        # should run first otherwise no saved model to load
        group.cluster()
