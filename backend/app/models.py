from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String, nullable=True)

    prices = relationship("Price", back_populates="store")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    brand = Column(String, nullable=True)
    category = Column(String, index=True, nullable=True)
    unit = Column(String, nullable=True)   # e.g. "L", "g", "item"
    size = Column(Float, nullable=True)    # e.g. 1.0 for 1L, 500 for 500g

    prices = relationship("Price", back_populates="product")


class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    price = Column(Float, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow)

    store = relationship("Store", back_populates="prices")
    product = relationship("Product", back_populates="prices")

