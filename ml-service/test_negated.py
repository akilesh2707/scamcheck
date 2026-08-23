def is_negated(text: str, keyword: str) -> bool:
    text_lower = text.lower()
    keyword_lower = keyword.lower()
    if keyword_lower not in text_lower: return False
    idx = text_lower.find(keyword_lower)
    while idx != -1:
        start = max(0, idx - 40)
        preceding = text_lower[start:idx]
        negations = [" no ", " not ", " never ", " without ", " don't ", " won't ", " 0 ", " zero ", " cannot ", " wouldn't "]
        if any(neg in " " + preceding + " " for neg in negations): return True
        idx = text_lower.find(keyword_lower, idx + 1)
    return False

print("otp:", is_negated("We never ask candidates for OTPs, passwords, or banking credentials.", "otp"))
print("password:", is_negated("We never ask candidates for OTPs, passwords, or banking credentials.", "password"))
print("banking credentials:", is_negated("We never ask candidates for OTPs, passwords, or banking credentials.", "banking credentials"))
