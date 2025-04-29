import pickle
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer
from sklearn.compose import ColumnTransformer
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from AI.Grouping.config import NUM_GROUPS, MODEL, GROUP_COL_NAME, RUN_SAVED_MODEL, DATA_FOLDER, PLOT
from AI.Grouping.plot import plot_unskew_transformation, plot_scaling, plot_kmeans
import shap
from shap import Explanation, KernelExplainer
from shap.plots import waterfall, beeswarm
from AI.Grouping.input_datas import client, public, public_min_max_hr_intenstiy

# similiar to group.py but uses shap to output explainability of the grouping model for use in the grouping dashboard popup text
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
        self.pipe = Pipeline([
            ('unskew_transformation', FunctionTransformer(self.unskew_transformation)),
            ('scaler', FunctionTransformer(self.feature_scaler)),
            ('model', self.model),
        ])

        self.tr= Pipeline([
            ('unskew_transformation', FunctionTransformer(self.unskew_transformation)),
            ('scaler', FunctionTransformer(self.feature_scaler)),
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

    def unskew_transformation(self, df):
        skewed_df = df.copy()
        for feature, skew_lambda in zip(self.group_features, self.features_skew_lambdas):
            df[feature] = self.box_cox_transformation(
                feature=feature, l=skew_lambda, df=df)
        # plot_unskew_transformation(skewed_df, df)
        return df

    def feature_scaler(self, df):
        scaler = StandardScaler()
        df[self.group_features] = scaler.fit_transform(
            df[self.group_features])
        # plot_scaling(df)
        return df[self.group_features]

    def cluster(self, new_datapoints_df=pd.DataFrame(), pat_id=131):
        saved_model_path = f'saved_trained_models/{MODEL}_{self.data_description}_saved_model.pk'
        if not new_datapoints_df.empty:
            # open saved model, and directly make the prediction with new data
            with open('./'+saved_model_path, 'rb') as f:
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
            # Transform, fit, predict 
            transformed_data = self.tr.transform(self.df)
            kmeans_labels_fit = self.model.fit(transformed_data)
            kmeans_labels_predict = kmeans_labels_fit.predict

            # self.global_exp(kmeans_labels_predict,transformed_data)
            exp = self.local_exp(kmeans_labels_predict, transformed_data, pat_id=pat_id)

            # 1503960366
            # 107

            with open('AI/Forecasting/'+saved_model_path, 'wb') as file:
                pickle.dump(self.pipe, file)

            sorted_labels = self.sort_cluster_labels(kmeans_labels_predict(transformed_data))

            self.df[GROUP_COL_NAME] = sorted_labels
            # save results to be queried via get_user_grouping
            self.df[[self.id_col_name, self.datetime_col_name,
                     GROUP_COL_NAME] + self.group_features].to_csv(self.grouped_data_path, index=False)
            if PLOT:
                plot_kmeans(sorted_labels, self.df, self.grouped_data_path,
                            self.datetime_col_name,
                            self.group_features)
            
            return exp


    def sort_cluster_labels(self, kmeans_labels, loaded_group_centers=[]):
        # Sort labels by average of the two clustering features, where lowest label is highest average fitness score
        group_centers = self.pipe['model'].cluster_centers_ if len(
            loaded_group_centers) == 0 else loaded_group_centers

        # {kmeans_label : group_center}
        group_centers_dict = dict(zip(range(NUM_GROUPS), list(group_centers)))
        group_centers = group_centers.tolist()  # (must be separate from sort)
        group_centers.sort(key=lambda l: (l[0] + l[1])/2, reverse=True)
        # {(group_center) : sorted_label}
        sorted_centers_dict = {tuple(c): i for i, c in enumerate(group_centers)}
        
        # get sorted_labels using kmeans labels
        sorted_labels = [sorted_centers_dict[tuple(group_centers_dict[l])] for l in kmeans_labels]
        print(sorted_labels[0])
        return sorted_labels
    

    # For global explanation
    def global_exp(self,p_model,t_data):
        explainer = shap.KernelExplainer(model=p_model,data=t_data)

        # retrieve shap values
        shap_values = explainer.shap_values(t_data)

        # calculate average shap values
        avg_abs_shap_values = np.abs(shap_values).mean(axis=0)
        avg_shap_values = shap_values.mean(axis=0)

        feature_names = self.group_features 

        feature_shap_dict = dict(zip(feature_names, avg_abs_shap_values))
        feature_shap_dict2 = dict(zip(feature_names, avg_shap_values))

        # sort features by shap values
        sorted_features = sorted(feature_shap_dict.items(), key=lambda x: x[1], reverse=True)
        sorted_features2 = sorted(feature_shap_dict2.items(), key=lambda x: x[1], reverse=True)

        top_feature = sorted_features[0][0]
    
        if top_feature=='TotalSteps':
            feature_name = 'Total Steps'
            sec_feature_name = 'Total Activity Minutes'
        else:
            feature_name = 'Total Activity Minutes'
            sec_feature_name = 'Total Steps'    

        print(f"Overall, {feature_name} had a bigger weight than {sec_feature_name} in grouping patients.") 

        # interpret result for each feature
        for feature in sorted_features2:
            print(feature[1])
            print(np.abs(feature[1]))

            impact = "positive" if feature[1] > 0 else "negative"
            higher_lower = "higher" if feature[1] > 0 else "lower"

            if feature[0]=='TotalSteps':
                feature_name1 = 'Total Steps'
            else:
                feature_name1 = 'Total Activity Minutes'
            
            print(f"{feature_name1} had a {impact} impact on the badge grouping meaning a higher value for this signifies a {higher_lower} group") 

        
    # For local explanation 
    def local_exp(self,p_model,t_data,pat_id):
        explainer = shap.KernelExplainer(model=p_model,data=t_data)
        
        output = []
        idCol = "id" if self.data_description=='client_fitbit_data' else "Id"

        # find index of given patient id
        patient_i = self.df[self.df[idCol]==pat_id].index.values.astype(int)[0]
        
        shap_values = explainer(t_data.iloc[patient_i:patient_i+1, :]) 

        patient_shap = shap_values[0] 

        # extract shap values for each feature
        abs_shap_values = [abs(value) for value in patient_shap.values]
        shap_value_feature1 = abs_shap_values[0] 
        shap_value_feature2 = abs_shap_values[1] 

        sorted_indices = sorted(range(len(abs_shap_values)), key=lambda k: abs_shap_values[k], reverse=True)
        feature_names = self.group_features

        top_feature_index = sorted_indices[0]
        top_feature = feature_names[top_feature_index]
        
        if self.data_description=='public_fitbit_data':
            if top_feature=='TotalSteps':
                top_feature_name = 'Total Steps'
                sec_feature_name = 'Total Activity Minutes'
            else:
                top_feature_name = 'Total Activity Minutes'
                sec_feature_name = 'Total Steps'
        else:
             if top_feature=='steps':
                top_feature_name = 'Total Steps'
                sec_feature_name = 'Total Intensity'
             else:
                top_feature_name = 'Total Intensity'
                sec_feature_name = 'Total Steps'

        # find percentage difference of shap values
        shap_diff = abs(shap_value_feature1 - shap_value_feature2)
        per_diff= round((shap_diff / abs(shap_value_feature1)) * 100,1)
        diff_group ='small'

        # interpret percentage differences
        if(per_diff<20):
            diff_group ='small'
        elif(per_diff<50):
            diff_group = 'moderate'
        else:
            diff_group = 'large'

        output.append(f"{top_feature_name} had a stronger influence than {sec_feature_name} by a {diff_group} margin.")

        
        for feature, shap_value in zip(feature_names, patient_shap):
            val = shap_value.values
            impact = "positive" if val > 0 else "negative"
            higher_lower = "higher" if val > 0 else "lower"

            if feature=='TotalSteps':
                feature_name1 = 'Total Steps'
            if feature=='TotalActivityMinutes':
                feature_name1 = 'Total Activity Minutes'
            if feature=='steps':
                feature_name1 = 'Total Steps'
            else:  
                feature_name1 = 'Total Intensity'

        output.append(f"This patient's {feature_name1} had a {impact} impact on the badge grouping meaning it contributed to them being grouped {higher_lower} than the average patient.")
        return " ".join(output)


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
