from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# For now use a local SQLite file. Later you can change this to PostgreSQL.
SQLALCHEMY_DATABASE_URL = "sqlite:///./shopping.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()