from fastapi import FastAPI, Depends, status
from sqlalchemy.orm import Session

from . import models, schemas
from .database import engine, get_db

# Create tables if they don't exist yet
models.Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Shopping Helper backend is running!"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    # Simple DB check: count stores
    count = db.query(models.Store).count()
    return {"status": "ok", "stores_in_db": count}

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
    return stores,