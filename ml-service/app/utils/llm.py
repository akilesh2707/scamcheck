import json
import httpx
from app.config import settings

def call_llm(system_prompt: str, user_prompt: str) -> dict:
    if not settings.LLM_API_KEY:
        raise ValueError("LLM_API_KEY not configured")

    headers = {
        "Authorization": f"Bearer {settings.LLM_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": settings.LLM_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"}
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                f"{settings.LLM_BASE_URL.rstrip('/')}/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)
    except httpx.TimeoutException:
        raise ValueError("LLM call failed: Connection timed out")
    except httpx.HTTPStatusError as e:
        raise ValueError(f"LLM call failed: HTTP {e.response.status_code}")
    except Exception as e:
        raise ValueError("LLM call failed: Internal service error")

def is_negated(text: str, keyword: str) -> bool:
    """Basic deterministic negation window (checks 6 words before the keyword)."""
    text_lower = text.lower()
    keyword_lower = keyword.lower()

    if keyword_lower not in text_lower:
        return False

    # Find all occurrences of the keyword
    idx = text_lower.find(keyword_lower)
    while idx != -1:
        # Get preceding 40 characters
        start = max(0, idx - 80)
        preceding = text_lower[start:idx]

        # Check for negations in preceding words
        negations = [" no ", " not ", " never ", " without ", " don't ", " won't ", " 0 ", " zero ", " cannot ", " wouldn't "]
        if any(neg in " " + preceding + " " for neg in negations):
            return True

        idx = text_lower.find(keyword_lower, idx + 1)

    return False
