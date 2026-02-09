"""Shorten AI response to 1-2 sentences for conversational chat."""
import re


# Max characters so lists of topics fit (e.g. "We can try weather, hobbies, or food. Which do you like?")
MAX_RESPONSE_CHARS = 320

# Allow up to 3 short sentences so the AI can give a real list without being cut at "1."
MAX_SENTENCES = 3


def summarize_response(text: str, max_sentences: int = MAX_SENTENCES, max_chars: int = MAX_RESPONSE_CHARS) -> str:
    """
    Shorten AI response to a few sentences so it stays conversational.
    Uses first 1-2 sentences and a character cap; no extra AI call.
    """
    if not text or not isinstance(text, str):
        return text

    normalized = re.sub(r"\s+", " ", text.strip())

    parts = re.split(r"(?<=[.!?])\s+", normalized)
    sentences = [p.strip() for p in parts if p.strip()]

    if not sentences:
        return normalized[:max_chars].strip()

    # Take up to max_sentences
    chosen = sentences[:max_sentences]
    result = " ".join(chosen).strip()

    # Hard cap by length so we never return a long block
    if len(result) > max_chars:
        result = result[:max_chars].rsplit(" ", 1)[0] if " " in result[:max_chars] else result[:max_chars]

    # Don't end on list fragments: "... started: 1." or ": 2." etc.
    result = re.sub(r":\s*\d+\.?\s*$", "", result)  # ": 1." or ":1." at end
    result = re.sub(r"\s+\d+\.\s*$", "", result)    # " 1." or " 2." at end
    result = re.sub(r":\s*$", "", result)
    result = result.strip()
    # If the last part looks like an incomplete list intro ("...to get you started", "...names to get you started"), drop it
    incomplete_intros = (
        r"\s*(?:Here are|here are)[^.!?]*(?:to get you started|to get you started\.?)\s*$",
        r"\s*(?:Here are|here are)[^.!?]*(?:suggestions?|topics?|names?|examples?)\s*:?\s*$",
    )
    for pat in incomplete_intros:
        result = re.sub(pat, "", result, flags=re.IGNORECASE)
        result = result.strip()
    # End on a complete sentence
    if result.endswith(":") or (len(result) > 0 and result[-1] not in ".!?"):
        last_end = max(result.rfind("."), result.rfind("!"), result.rfind("?"))
        if last_end > 0:
            result = result[: last_end + 1].strip()

    return result
