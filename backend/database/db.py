"""
Database setup — SQLite by default, PostgreSQL via DATABASE_URL env var.
"""
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medico.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String, index=True)
    generic_name = Column(String, index=True)
    salt_composition = Column(String)
    manufacturer = Column(String)
    brand_price_per_unit = Column(Float)
    unit_type = Column(String)
    generic_price_per_unit = Column(Float)
    jan_aushadhi_price = Column(Float, nullable=True)
    category = Column(String)
    strength = Column(String)
    form = Column(String)


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    medicines_searched = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session_id = Column(String)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create tables and seed from CSV if empty."""
    Base.metadata.create_all(bind=engine)
    _seed_if_empty()


def _seed_if_empty():
    import pandas as pd
    db = SessionLocal()
    try:
        count = db.query(Medicine).count()
        if count > 0:
            print(f"[DB] Database already has {count} medicines.")
            return
        
        csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "medicines.csv")
        csv_path = os.path.abspath(csv_path)
        
        if not os.path.exists(csv_path):
            print(f"[DB] WARNING: medicines.csv not found at {csv_path}")
            print(f"[DB]          Current working directory: {os.getcwd()}")
            print(f"[DB]          __file__: {__file__}")
            return
        
        print(f"[DB] Loading medicines from {csv_path}...")
        df = pd.read_csv(csv_path)
        print(f"[DB] CSV has {len(df)} rows and {len(df.columns)} columns")
        
        df = df.where(pd.notna(df), None)
        for _, row in df.iterrows():
            med = Medicine(
                brand_name=str(row["brand_name"]).strip(),
                generic_name=str(row["generic_name"]).strip(),
                salt_composition=str(row["salt_composition"]).strip(),
                manufacturer=str(row["manufacturer"]).strip(),
                brand_price_per_unit=float(row["brand_price_per_unit"]),
                unit_type=str(row["unit_type"]).strip(),
                generic_price_per_unit=float(row["generic_price_per_unit"]),
                jan_aushadhi_price=float(row["jan_aushadhi_price"]) if row["jan_aushadhi_price"] else None,
                category=str(row["category"]).strip(),
                strength=str(row["strength"]).strip(),
                form=str(row["form"]).strip(),
            )
            db.add(med)
        db.commit()
        print(f"[DB] Successfully seeded {len(df)} medicines into database.")
    except Exception as e:
        print(f"[DB] ERROR during seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()
