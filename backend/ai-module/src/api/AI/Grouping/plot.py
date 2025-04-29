import matplotlib.pyplot as plt
from matplotlib.pyplot import cm
import seaborn as sns
import numpy as np
import pandas as pd
from mpl_toolkits.mplot3d import Axes3D

from AI.Grouping.config import NUM_GROUPS, GROUP_COL_NAME


def plot_unskew_transformation(skewed_df, unskewed_df, group_features):
    fig, ax = plt.subplots(len(group_features), 2, figsize=(15, 10))
    for i, feature in enumerate(group_features):
        sns.histplot(skewed_df[feature], kde=True, ax=ax[i][0], color='red').set(
            title=f"Before unskew={skewed_df[feature].skew():0.2f}")
        sns.histplot(unskewed_df[feature], kde=True, ax=ax[i][1]).set(
            title=f"After unskew={unskewed_df[feature].skew():0.2f}")
    plt.show()
    plt.close()


def plot_scaling(df, group_features):
    if len(group_features) == 2:
        plt.plot(df[group_features[0]].values, df[group_features[1]].values, '.')
        plt.xlabel(group_features[0])
        plt.ylabel(group_features[1])
        plt.title(f'{group_features[0]} vs {group_features[1]} scaled values')
        plt.show()
        plt.close()
    elif len(group_features) == 3:
        fig = plt.figure()
        ax = fig.add_subplot(111, projection='3d')
        ax.scatter(df[group_features[0]], df[group_features[1]], df[group_features[2]])
        plt.title(f'Scaled values')
        plt.show()
        plt.close()
    else:
        print('Error: Grouping more on 1 or more than 3 features is not supported')


def plot_kmeans(labels, scaled_df, grouped_data_path, datetime_col_name, group_features, loaded_model=False):
    colours = cm.Set1(np.linspace(0, 1, NUM_GROUPS))
    if loaded_model:
        # combine the new point labels with the trained data point labels
        try:
            saved_df = pd.read_csv(grouped_data_path, index_col=datetime_col_name)
            saved_df.index = pd.to_datetime(saved_df.index, utc=True)
            model_labels = saved_df[GROUP_COL_NAME].values
            # plot the new saved model labels
            if len(group_features) == 2:
                for l in np.unique(model_labels):
                    plt.scatter(
                        saved_df[model_labels == l][group_features[0]],
                        saved_df[model_labels == l][group_features[1]],
                        label=l, c=colours[l])
            else:
                print('Only 2 features are supported for plotting the loaded model results')

        except FileNotFoundError:
            print('Error: File not found. \nNote: Run "groupy.py" first to load the grouped_data results and check "config.py" path is correct')

    # plot 2D or 3D kmean clustering results depending on the number of features given in the input data to group on
    if len(group_features) == 2:
        for l in np.unique(labels):
            plt.scatter(
                scaled_df[labels == l][group_features[0]],
                scaled_df[labels == l][group_features[1]],
                label=l, color=colours[l])
            if loaded_model:
                # circle the new datapoint plots
                plt.plot(scaled_df[labels == l][group_features[0]],
                         scaled_df[labels == l][group_features[1]],
                         'o', ms=7 * 2, mec='black', mfc='none', mew=3, label=None)

        plt.legend(range(NUM_GROUPS))
        plt.title(f"Clustering Daily {group_features[0]} vs {group_features[1]}")
        plt.xlabel(group_features[0])
        plt.ylabel(group_features[1])
        path = f'grouping_plots/KMeans_{group_features[0]}_{group_features[1]}_Grouping.png'
        plt.savefig(path)
        plt.show()
        plt.close()
    elif len(group_features) == 3:
        u_labels = np.unique(labels)
        fig = plt.figure()
        ax = fig.add_subplot(111, projection='3d')
        for i in u_labels:
            ax.scatter(
                scaled_df[labels == i][group_features[0]],
                scaled_df[labels == i][group_features[1]],
                scaled_df[labels == i][group_features[2]],
                label=i)

        plt.xlabel('min_heart_rate')
        plt.ylabel('max_heart_rate')
        ax.set_zlabel('intensity', fontsize=11, rotation=60)
        plt.legend()
        plt.show()
        plt.close()
    else:
        print('Error: 1 or more than 3 features to group on is not supported')
