import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from features import build_frame

df = pd.read_csv("dataset.csv")
X = build_frame(df["answer"], df["keywords"])
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print("Train size:", len(X_train), "| Test size:", len(X_test))

pre = ColumnTransformer([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2), "answer"),
    ("num", "passthrough", ["kw_ratio", "word_count"]),
])
model = Pipeline([
    ("pre", pre),
    ("clf", LogisticRegression(max_iter=2000)),
])

model.fit(X_train, y_train)
pred = model.predict(X_test)

print("\nTest accuracy:", round(accuracy_score(y_test, pred), 3))
print("\nReport:\n", classification_report(y_test, pred))
print("Confusion matrix:\n", confusion_matrix(y_test, pred, labels=["poor", "average", "good"]))

joblib.dump(model, "model.pkl")
print("\nModel saved as model.pkl")