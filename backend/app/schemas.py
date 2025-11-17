from pydantic import BaseModel
from typing import Optional


# -------- Base schema (shared fields) --------
class StoreBase(BaseModel):
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None


# -------- Schema for creating a store (request body) --------
class StoreCreate(StoreBase):
    """
    What the client must send when creating a store.
    Inherits from StoreBase (so same fields).
    """
    pass


# -------- Schema for reading a store (response) --------
class StoreRead(StoreBase):
    id: int  # DB-generated ID

    class Config:
        orm_mode = True
