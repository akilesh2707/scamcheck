import pytest
from app.extraction.opportunity_extractor import extract_deterministic

def test_extract_deterministic_internship_and_fees():
    text = "Congratulations! You have been selected for a software development internship. Pay ₹1,999 as a registration and training fee to confirm your seat."
    
    result = extract_deterministic(text)
    
    # 1. "software development internship" -> INTERNSHIP
    assert result.type == "INTERNSHIP"
    
    # 3. extracted title must not lose its first character
    assert "software development internship" in result.role
    
    # 2. "Pay ₹1,999" -> fee/payment, NOT stipend
    assert result.stipend is None
    assert result.fees is not None
    assert result.fees.get("registration") == 1999
