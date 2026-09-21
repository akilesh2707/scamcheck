from app.payment.payment_verifier import verify_payment_deterministic, PaymentVerifyRequest, Opportunity

def test_payment_vs_stipend():
    text = "We offer a monthly stipend of ₹15,000. However, there is a registration fee of ₹1,999."
    req = PaymentVerifyRequest(opportunity=Opportunity(rawText=text, fees={"registration": 1999}))
    res = verify_payment_deterministic(req)
    
    assert res.required is True
    assert res.amount == 1999
    assert res.status == "NEEDS_VERIFICATION"

def test_no_fee_required():
    text = "Training is completely free. We offer a salary of ₹30,000. Never pay us any registration fee."
    req = PaymentVerifyRequest(opportunity=Opportunity(rawText=text))
    res = verify_payment_deterministic(req)
    
    assert res.required is False
    assert res.status == "NEGATED"
