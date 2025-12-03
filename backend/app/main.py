from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session


from . import models, schemas
from .database import engine, get_db

# Create tables if they don't exist yet
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Shopping Helper backend is running!"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    # Simple DB check: count stores
    count = db.query(models.Store).count()
    return {"status": "ok", "stores_in_db": count}

# =========================
# STORES ENDPOINTS
# =========================

@app.post("/stores", response_model=schemas.StoreRead, status_code=status.HTTP_201_CREATED)
def create_store(store: schemas.StoreCreate, db: Session = Depends(get_db)):
    # 1. Create a Store DB object from the incoming data
    db_store = models.Store(
        name=store.name,
        latitude=store.latitude,
        longitude=store.longitude,
        address=store.address,
    )
    # 2. Add it to the session (staging area)
    db.add(db_store)

    # 3. Commit the transaction (actually write to the DB)
    db.commit()

    # 4. Refresh the object with data from DB (now it has an id)
    db.refresh(db_store)

    # 5. Return it – FastAPI will convert it using StoreRead schema
    return db_store

@app.get("/stores", response_model=list[schemas.StoreRead])
def get_stores(db: Session = Depends(get_db)):
    stores = db.query(models.Store).all()
    return stores

@app.put("/stores/{store_id}", response_model=schemas.StoreRead)
def update_store(
    store_id: int,
    store: schemas.StoreUpdate,
    db: Session = Depends(get_db),
):
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if db_store is None:
        raise HTTPException(status_code=404, detail="Store not found")

    update_data = store.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_store, field, value)

    db.commit()
    db.refresh(db_store)
    return db_store

@app.delete("/stores/{store_id}", status_code=204)
def delete_store(store_id: int, db: Session = Depends(get_db)):
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()

    if db_store is None:
        raise HTTPException(status_code=404, detail="Store not found")

    db.delete(db_store)
    db.commit()

    # 204 = Deleted successfully, no content
    return

# =========================
# PRODUCTS ENDPOINTS
# =========================

@app.post("/products", response_model=schemas.ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
):
    db_product = models.Product(
        name=product.name,
        brand=product.brand,
        category=product.category,
        unit=product.unit,
        size=product.size,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@app.get("/products", response_model=list[schemas.ProductRead])
def list_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    return products


@app.get("/products/{product_id}", response_model=schemas.ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.put("/products/{product_id}", response_model=schemas.ProductRead)
def update_product(
    product_id: int,
    product: schemas.ProductUpdate,
    db: Session = Depends(get_db),
):
    db_product = (
        db.query(models.Product).filter(models.Product.id == product_id).first()
    )
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return db_product


@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = (
        db.query(models.Product).filter(models.Product.id == product_id).first()
    )
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(db_product)
    db.commit()
    return

# =========================
# PRICE ENDPOINTS
# =========================

@app.post("/prices", response_model=schemas.PriceRead, status_code=status.HTTP_201_CREATED)
def create_price(price: schemas.PriceCreate, db: Session = Depends(get_db)):
    db_price = models.Price(
        store_id=price.store_id,
        product_id=price.product_id,
        price=price.price,
    )
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    return db_price


@app.get("/prices", response_model=list[schemas.PriceRead])
def list_prices(db: Session = Depends(get_db)):
    return db.query(models.Price).all()


@app.get("/prices/{price_id}", response_model=schemas.PriceRead)
def get_price(price_id: int, db: Session = Depends(get_db)):
    db_price = db.query(models.Price).filter(models.Price.id == price_id).first()
    if not db_price:
        raise HTTPException(status_code=404, detail="Price not found")
    return db_price


@app.put("/prices/{price_id}", response_model=schemas.PriceRead)
def update_price(
    price_id: int,
    price: schemas.PriceUpdate,
    db: Session = Depends(get_db),
):
    db_price = db.query(models.Price).filter(models.Price.id == price_id).first()
    if not db_price:
        raise HTTPException(status_code=404, detail="Price not found")

    update_data = price.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_price, field, value)

    db.commit()
    db.refresh(db_price)
    return db_price


@app.delete("/prices/{price_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_price(price_id: int, db: Session = Depends(get_db)):
    db_price = db.query(models.Price).filter(models.Price.id == price_id).first()
    if not db_price:
        raise HTTPException(status_code=404, detail="Price not found")
    db.delete(db_price)
    db.commit()
    return


