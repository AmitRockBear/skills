"""Writes script.json from LINES. Each line: (scene, caption[, hold seconds]).
The caption is shown on screen; the spoken text is derived from it by SAY (acronyms, symbols, tricky names)."""
import json, re
from pathlib import Path

# spoken forms, applied with word boundaries, longest first. Add every acronym or symbol the script uses.
SAY = {
    "AI": "A I", "API": "A P I", "APIs": "A P Is", "CPU": "C P U", "SDK": "S D K", "URL": "U R L",
    "$5": "five dollars", "5%": "five percent",
}
_re = re.compile("|".join(r"(?<![\w$])" + re.escape(k) + r"(?![\w])" for k in sorted(SAY, key=len, reverse=True)))


def say(cap: str) -> str:
    return _re.sub(lambda m: SAY[m.group(0)], cap).replace('"', "")


LINES = [
    ("intro", "Hi there! Today we're learning about SUBJECT."),
    ("intro", "No background needed. We'll build one example together, piece by piece.", .6),
    ("outro", "Thanks for learning with me!", 2.0),
]


def main():
    out = []
    for scene, cap, *rest in LINES:
        d = {"scene": scene, "cap": cap}
        if say(cap) != cap:
            d["say"] = say(cap)
        if rest:
            d["hold"] = rest[0]
        out.append(d)
    Path(__file__).with_name("script.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
    print(len(out), "lines,", len(dict.fromkeys(d["scene"] for d in out)), "scenes")


if __name__ == "__main__":
    main()
