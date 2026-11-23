import pandas as pd

def build_frame(answers, keywords_list):
    rows = []
    for answer, keywords in zip(answers, keywords_list):
        text = answer.lower()
        kws = keywords if isinstance(keywords, list) else keywords.split("|")
        matched = sum(1 for k in kws if k.lower() in text)
        rows.append({
            "answer": answer,
            "kw_ratio": matched / max(len(kws), 1),
            "word_count": len(answer.split()),
        })
    return pd.DataFrame(rows)