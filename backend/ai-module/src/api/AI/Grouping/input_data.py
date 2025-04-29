class InputData():
    def __init__(
            self, path, data_description, features, features_skew_lambdas, id_col_name,
            datetime_col_name):
        self.path = path
        self.data_description = data_description
        # features to group on
        self.features = features
        self.features_skew_lambdas = features_skew_lambdas

        self.id_col_name = id_col_name
        self.datetime_col_name = datetime_col_name
