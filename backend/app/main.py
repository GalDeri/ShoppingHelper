from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from . import models
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