#%%
import scipy.io

mnist = scipy.io.loadmat("scikit_learn_data\\mnist-original.mat")

#%%
X, y = mnist["data"], mnist["label"]
X = X.T
y = y.T
c, r = y.shape
y = y.reshape(c,)
print(X.shape)
print(y.shape)
#%%
# %matplotlib inline
import matplotlib
import matplotlib.pyplot as plt

some_digit = X[25432]
some_digit_image = some_digit.reshape(28, 28)

plt.imshow(some_digit_image, cmap=matplotlib.cm.binary, interpolation="nearest")
plt.axis("off")
plt.show
print(y[25432])
#%%
X_train, X_test, y_train, y_test = X[:60000], X[60000:], y[:60000], y[60000:]


#%%
import numpy as np

shuffle_index = np.random.permutation(60000)
X_train, y_train = X_train[shuffle_index], y_train[shuffle_index]

#%%
y_train_4 = y_train == 4
y_test_4 = y_test == 4


#%%
from sklearn.linear_model import SGDClassifier

sgd_clf = SGDClassifier(random_state=42)
sgd_clf.fit(X_train, y_train_4)

print(sgd_clf.predict([some_digit]))

#%%
from sklearn.model_selection import cross_val_score

cross_val_score(sgd_clf, X_train, y_train_4, cv=3, scoring="accuracy")

#%%
from sklearn.base import BaseEstimator


class Never4Classifier(BaseEstimator):
    def fit(self, X, y=None):
        pass

    def predict(self, X):
        return np.zeros((len(X), 1), dtype=bool)


never_4_clf = Never4Classifier()
cross_val_score(never_4_clf, X_train, y_train_4, cv=3, scoring="accuracy")

#%%
from sklearn.model_selection import cross_val_predict

y_train_pred = cross_val_predict(sgd_clf, X_train, y_train_4, cv=3)

#%%
from sklearn.metrics import confusion_matrix

confusion_matrix(y_train_4, y_train_pred)

#%%
from sklearn.metrics import precision_score, recall_score

print(precision_score(y_train_4, y_train_pred))
print(recall_score(y_train_4, y_train_pred))

#%%
from sklearn.metrics import f1_score

print(f1_score(y_train_4, y_train_pred))

#%%
y_scores = sgd_clf.decision_function([some_digit])
print(y_scores)
threshold = 0
y_some_digit_pred = y_scores > threshold
print(y_some_digit_pred)
threshold = 300000
y_some_digit_pred = y_scores > threshold
print(y_some_digit_pred)

#%%
y_scores = cross_val_predict(
    sgd_clf, X_train, y_train_4, cv=3, method="decision_function"
)

from sklearn.metrics import precision_recall_curve

precisions, recalls, thresholds = precision_recall_curve(y_train_4, y_scores)


def plot_precision_recall_vs_threshold(precisions, recalls, thresholds):
    plt.plot(thresholds, precisions[:-1], "b--", label="Precision")
    plt.plot(thresholds, recalls[:-1], "g-", label="Recall")
    plt.xlabel("Threshold")
    plt.legend(loc="upper left")
    plt.ylim([0, 1])


plot_precision_recall_vs_threshold(precisions, recalls, thresholds)
plt.show()

#%%
from sklearn.metrics import roc_curve

fpr, tpr, thresholds = roc_curve(y_train_4, y_scores)


def plot_roc_curve(fpr, tpr, label=None):
    plt.plot(fpr, tpr, linewidth=2, label=label)
    plt.plot([0, 1], [0, 1], "k--")
    plt.axis([0, 1, 0, 1])
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")


plot_roc_curve(fpr, tpr)
plt.show()

#%%
from sklearn.metrics import roc_auc_score

print(roc_auc_score(y_train_4, y_scores))

#%%
from sklearn.ensemble import RandomForestClassifier

forest_clf = RandomForestClassifier(random_state=42)
y_probas_forest = cross_val_predict(
    forest_clf, X_train, y_train_4, cv=3, method="predict_proba"
)
y_scores_forest = y_probas_forest[:, 1]
fpr_forest, tpr_forest, thresholds_forest = roc_curve(y_train_4, y_scores_forest)

plt.plot(fpr, tpr, "b:", label="SGD")
plot_roc_curve(fpr_forest, tpr_forest, "Random Forest")
plt.legend(loc="bottom right")
plt.show()

#%%
print(roc_auc_score(y_train_4, y_scores_forest))

#%%
sgd_clf.fit(X_train, y_train)
print(sgd_clf.predict([some_digit]))

#%%
from sklearn.neighbors import KNeighborsClassifier

y_train_large = y_train >= 7
y_train_odd = y_train % 2 == 1
y_multilabel = np.c_[y_train_large, y_train_odd]

knn_clf = KNeighborsClassifier()
knn_clf.fit(X_train, y_multilabel)

print(knn_clf.predict([some_digit]))


#%%
y_train_knn_pred = cross_val_predict(knn_clf, X_train, y_train, cv=3)
print(f1_score(y_train, y_train_knn_pred, average="macro"))

#%%
noise = np.randint(0, 100, (len(X_train), 784))
noise = np.randint(0, 100, (len(X_test), 784))

X_train_mod = X_train + noise
X_test_mod = X_test + noise
y_train_mod = X_train
y_test_mod = X_test
