import json, random, csv

random.seed(42)

with open("../backend/data/questionBank.json") as f:
    bank = json.load(f)

filler = ["I think", "in my experience", "basically", "for example",
          "because", "also", "so", "and then", "which helps",
          "in my project", "I have learned that", "it is important"]
weak = ["I do not know", "maybe", "not sure about this", "I like movies",
        "it is fine", "yes", "no idea", "something like that",
        "I have not studied this", "good question"]

LEVELS = {
    "good":    {"ratio": (0.6, 1.0),  "words": (30, 80)},
    "average": {"ratio": (0.25, 0.65), "words": (15, 45)},
    "poor":    {"ratio": (0.0, 0.25), "words": (2, 20)},
}

def make_answer(keywords, label):
    cfg = LEVELS[label]
    ratio = random.uniform(*cfg["ratio"])
    k = round(len(keywords) * ratio)
    parts = []
    for kw in random.sample(keywords, k):
        parts += random.sample(filler, 1) + [kw]
    target = random.randint(*cfg["words"])
    pool = weak if label == "poor" else filler
    while len(" ".join(parts).split()) < target:
        parts.append(random.choice(pool))
    random.shuffle(parts)
    return " ".join(parts)

rows = []
for category, questions in bank.items():
    for item in questions:
        for label in LEVELS:
            for _ in range(12):
                rows.append({
                    "question": item["q"],
                    "keywords": "|".join(item["keywords"]),
                    "answer": make_answer(item["keywords"], label),
                    "label": label,
                })

random.shuffle(rows)
with open("dataset.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["question", "keywords", "answer", "label"])
    writer.writeheader()
    writer.writerows(rows)

print("Rows created:", len(rows))