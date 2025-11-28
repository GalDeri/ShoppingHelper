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
        from_attributes = True

# schema for updating a store (all fields optional)
class StoreUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None

class ProductBase(BaseModel):
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None   # "L", "g", "item"
    size: Optional[float] = None # 1.0 for 1L, 500 for 500g


class ProductCreate(ProductBase):
    """
    Request body for creating a product.
    """
    pass


class ProductRead(ProductBase):
    id: int

    class Config:
        from_attributes = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    size: Optional[float] = None