"""
Pydantic schemas for User Agreement & Terms of Service.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict


class AgreementTermsOut(BaseModel):
    version: str
    title: str
    last_updated: str
    content: str
    sections: List[Dict[str, str]]


class AgreementAcceptPayload(BaseModel):
    agreed: bool = True


class AgreementStatusOut(BaseModel):
    user_id: str
    agreed_to_terms: bool
    agreed_at: Optional[str] = None
