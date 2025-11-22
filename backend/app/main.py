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