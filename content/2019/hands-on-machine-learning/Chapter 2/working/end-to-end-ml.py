#%%
import pandas as pd

# %matplotlib inline
import matplotlib.pyplot as plt

csv_path = "C:\\Users\\jackm\\Documents\\Hands On ML\\handson-ml-master\\datasets\\housing\\housing.csv"
import numpy as np
import hashlib

#%%
def split_train_test(data, test_ratio):
    shuffled_indices = np.random.permutation(len(data))
    test_set_size = int(len(data) * test_ratio)
    test_indices = shuffled_indices[:test_set_size]
    train_indices = shuffled_indices[test_set_size:]
    return data.iloc[train_indices], data.iloc[test_indices]


def test_set_check(identifier, test_ratio, hash):
    return hash(np.int64(identifier)).digest()[-1] < 256 * test_ratio


def split_train_test_by_id(data, test_ratio, id_column, hash=hashlib.md5):
    ids = data[id_column]
    in_test_set = ids.apply(lambda id_: test_set_check(id_, test_ratio, hash))
    return data.loc[~in_test_set], data.loc[in_test_set]


#%%

housing = pd.read_csv(csv_path)


#%%
display(housing)
display(housing.info())
display(housing.describe())

#%%
housing.hist(bins=50, figsize=(20, 15))
plt.show()

#%%
train_set, test_set = split_train_test(housing, 0.2)
print("{:f} train + {:2f} test".format(len(train_set), len(test_set)))

#%%
housing_with_id = housing.reset_index()
train_set, test_set = split_train_test_by_id(housing_with_id, 0.2, "index")

#%%
housing_with_id["id"] = housing["longitude"] * 1000 + housing["latitude"]
train_set, test_set = split_train_test_by_id(housing_with_id, 0.2, "id")

#%%
from sklearn.model_selection import train_test_split

train_set, test_set = train_test_split(housing, test_size=0.2, random_state=42)

#%%
housing["income_cat"] = np.ceil(housing["median_income"] / 1.5)
housing["income_cat"].where(housing["income_cat"] < 5, 5.0, inplace=True)


#%%
from sklearn.model_selection import StratifiedShuffleSplit

split = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
for train_index, test_index in split.split(housing, housing["income_cat"]):
    strat_train_set = housing.loc[train_index]
    strat_test_set = housing.loc[test_index]

#%%
housing["income_cat"].value_counts() / len(housing)

#%%
for set in (strat_train_set, strat_test_set):
    set.drop(["income_cat"], axis=1, inplace=True)

#%%
housing = strat_test_set.copy()
housing.plot(
    kind="scatter",
    x="longitude",
    y="latitude",
    alpha=0.4,
    s=housing["population"] / 100,
    label="population",
    c="median_house_value",
    cmap=plt.get_cmap("jet"),
    colorbar=True,
)
plt.legend()

#%%
corr_matrix = housing.corr()

print(corr_matrix["median_house_value"].sort_values(ascending=False))

#%%
from pandas.tools.plotting import scatter_matrix

attributes = [
    "median_house_value",
    "median_income",
    "total_rooms",
    "housing_median_age",
]
scatter_matrix(housing[attributes], figsize=(12, 8))


#%%
housing.plot(kind="scatter", x="median_income", y="median_house_value", alpha=0.1)


#%%
housing["rooms_per_household"] = housing["total_rooms"] / housing["households"]
housing["bedrooms_per_room"] = housing["total_bedrooms"] / housing["total_rooms"]
housing["population_per_household"] = housing["population"] / housing["households"]

#%%
housing = strat_train_set.drop("median_house_value", axis=1)
housing_labels = strat_train_set["median_house_value"].copy()

#%%
housing.dropna(subset=["total_bedrooms"])

#%%
from sklearn.preprocessing import Imputer

imputer = Imputer(strategy="median")

#%%
housing_num = housing.drop("ocean_proximity", axis=1)

#%%
imputer.fit(housing_num)

#%%
X = imputer.transform(housing_num)
display(X)

#%%
housing_tr = pd.DataFrame(X, columns=housing_num.columns)

#%%
from sklearn.preprocessing import LabelEncoder

encoder = LabelEncoder()
housing_cat = housing["ocean_proximity"]
housing_cat_encoded = encoder.fit_transform(housing_cat)
display(housing_cat_encoded)

#%%
from sklearn.preprocessing import OneHotEncoder

encoder = OneHotEncoder()
housing_cat_1hot = encoder.fit_transform(housing_cat_encoded.reshape(-1, 1))
display(housing_cat_1hot)

#%%
from sklearn.preprocessing import LabelBinarizer

encoder = LabelBinarizer()
housing_cat_1hot = encoder.fit_transform(housing_cat)
housing_cat_1hot

#%%
from sklearn.base import BaseEstimator, TransformerMixin

rooms_ix, bedrooms_ix, population_ix, household_ix = 3, 4, 5, 6


class CombinedAttributesAdder(BaseEstimator, TransformerMixin):
    def __init__(self, add_bedrooms_per_room=True):
        self.add_bedrooms_per_room = add_bedrooms_per_room

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        rooms_per_household = X[:, rooms_ix] / X[:, household_ix]
        population_per_household = X[:, population_ix] / X[:, household_ix]
        if self.add_bedrooms_per_room:
            bedrooms_per_room = X[:, bedrooms_ix] / X[:, household_ix]
            return np.c_[
                X, rooms_per_household, population_per_household, bedrooms_per_room
            ]
        else:
            return np.c_[X, rooms_per_household, population_per_household]


attr_adder = CombinedAttributesAdder(add_bedrooms_per_room=False)
housing_extra_attribs = attr_adder.transform(housing.values)

#%%
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

num_pipeline = Pipeline(
    [
        ("imputer", Imputer(strategy="median")),
        ("attribs_adder", CombinedAttributesAdder()),
        ("std_scaler", StandardScaler()),
    ]
)

housing_num_tr = num_pipeline.fit_transform(housing_num)
housing_num_tr

#%%
from sklearn.base import BaseEstimator, TransformerMixin


class DataFrameSelector(BaseEstimator, TransformerMixin):
    def __init__(self, attribute_names):
        self.attribute_names = attribute_names

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return X[self.attribute_names].values


#%%
from sklearn.pipeline import FeatureUnion

num_attribs = list(housing_num)
cat_attribs = ["ocean_proximity"]
num_pipeline = Pipeline(
    [
        ("selector", DataFrameSelector(num_attribs)),
        ("imputer", Imputer(strategy="median")),
        ("attribs_adder", CombinedAttributesAdder()),
        ("std_scaler", StandardScaler()),
    ]
)
cat_pipeline = Pipeline(
    [
        ("selector", DataFrameSelector(cat_attribs)),
        ("label_binarizer", LabelBinarizer()),
    ]
)
full_pipeline = FeatureUnion(
    transformer_list=[("num_pipeline", num_pipeline), ("cat_pipeline", cat_pipeline),]
)


#%%
housing_prepared = full_pipeline.fit_transform(housing)
housing_prepared
housing_prepared.shape

#%%
from sklearn.linear_model import LinearRegression

lin_reg = LinearRegression()
lin_reg.fit(housing_prepared, housing_labels)

#%%
some_data = housing.iloc[:5]
some_labels = housing_labels.iloc[:5]
some_prepped_data = full_pipeline.transform(some_data)
print("Predictions:", lin_reg.predict(some_prepped_data))
print("Labels:", list(some_labels))

#%%
from sklearn.metrics import mean_squared_error

housing_predictions = lin_reg.predict(housing_prepared)
lin_mse = mean_squared_error(housing_labels, housing_predictions)
lin_rmse = np.sqrt(lin_mse)
print(lin_rmse)

#%%
from sklearn.tree import DecisionTreeRegressor

tree_reg = DecisionTreeRegressor()
tree_reg.fit(housing_prepared, housing_labels)
housing_predictions = tree_reg.predict(housing_prepared)
tree_mse = mean_squared_error(housing_labels, housing_predictions)
tree_rmse = np.sqrt(tree_mse)
print(tree_rmse)

#%%
from sklearn.model_selection import cross_val_score

scores = cross_val_score(
    tree_reg, housing_prepared, housing_labels, scoring="neg_mean_squared_error", cv=10
)
tree_rmse_scores = np.sqrt(-scores)


def display_scores(scores):
    print("Scores: ", scores)
    print("Mean: ", scores.mean())
    print("Std Dev: ", scores.std())


display_scores(tree_rmse_scores)

#%%
lin_scores = cross_val_score(
    lin_reg, housing_prepared, housing_labels, scoring="neg_mean_squared_error", cv=10
)
lin_rmse_scores = np.sqrt(-lin_scores)

display_scores(lin_rmse_scores)

#%%
from sklearn.ensemble import RandomForestRegressor

rand_reg = RandomForestRegressor()
rand_reg.fit(housing_prepared, housing_labels)
housing_predictions = rand_reg.predict(housing_prepared)
rand_mse = mean_squared_error(housing_labels, housing_predictions)
rand_rmse = np.sqrt(rand_mse)
print(rand_rmse)

rand_scores = cross_val_score(
    rand_reg, housing_prepared, housing_labels, scoring="neg_mean_squared_error", cv=10
)
rand_rmse_scores = np.sqrt(-rand_scores)

display_scores(rand_rmse_scores)

#%%
from sklearn.model_selection import GridSearchCV

param_grid = [
    {"n_estimators": [3, 10, 30], "max_features": [2, 4, 6, 8]},
    {"bootstrap": [False], "n_estimators": [3, 10], "max_features": [2, 3, 4]},
]

forest_reg = RandomForestRegressor()
grid_search = GridSearchCV(
    forest_reg, param_grid, cv=5, scoring="neg_mean_squared_error"
)

grid_search.fit(housing_prepared, housing_labels)

#%%
print(grid_search.best_params_)
print(grid_search.best_estimator_)
cvres = grid_search.cv_results_
for mean_score, params in zip(cvres["mean_test_score"], cvres["params"]):
    print(np.sqrt(-mean_score), params)

#%%
feature_importances = grid_search.best_estimator_.feature_importances_
print(feature_importances)

#%%
extra_attribs = ["rooms_per_hhold", "pop_per_hhold", "bedrooms_per_room"]
cat_one_hot_attrib = list(encoder.classes_)
attributes = num_attribs + extra_attribs + cat_one_hot_attrib
print(sorted(zip(feature_importances, attributes), reverse=True))

#%%
final_model = grid_search.best_estimator_

x_test = strat_test_set.drop("median_house_value", axis=1)
y_test = strat_test_set["median_house_value"].copy()

x_test_prepared = full_pipeline.transform(x_test)

final_predictions = final_model.predict(x_test_prepared)

final_mse = mean_squared_error(y_test, final_predictions)

final_rmse = np.sqrt(final_mse)

print(final_mse)
print(final_rmse)

#%%
# EXERCISES

from sklearn.model_selection import GridSearchCV
from sklearn.svm import SVR

param_grid = [
    {
        "kernel": ["linear"],
        "C": [10.0, 30.0, 100.0, 300.0, 1000.0, 3000.0, 10000.0, 30000.0],
    },
    {
        "kernel": ["rbf"],
        "C": [1.0, 3.0, 10.0, 30.0, 100.0, 300.0, 1000.0],
        "gamma": [0.01, 0.03, 0.1, 0.3, 1.0, 3.0],
    },
]

svm_reg = SVR()
grid_search = GridSearchCV(
    svm_reg, param_grid, cv=5, scoring="neg_mean_squared_error", verbose=2, n_jobs=4
)
grid_search.fit(housing_prepared, housing_labels)


#%%
