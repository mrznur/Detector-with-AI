"""
Migration script to update persons table schema
Run this once to migrate from old schema to new schema
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Start transaction
        trans = conn.begin()
        
        try:
            # Add new columns
            print("Adding age column...")
            conn.execute(text("ALTER TABLE persons ADD COLUMN IF NOT EXISTS age INTEGER"))
            
            print("Adding gender column...")
            conn.execute(text("ALTER TABLE persons ADD COLUMN IF NOT EXISTS gender VARCHAR"))
            
            # Drop old columns
            print("Dropping email column...")
            conn.execute(text("ALTER TABLE persons DROP COLUMN IF EXISTS email"))
            
            print("Dropping phone column...")
            conn.execute(text("ALTER TABLE persons DROP COLUMN IF EXISTS phone"))
            
            print("Dropping department column...")
            conn.execute(text("ALTER TABLE persons DROP COLUMN IF EXISTS department"))
            
            # Commit transaction
            trans.commit()
            print("\n✅ Migration completed successfully!")
            print("New schema: id, name, age, gender, employee_id, is_active, created_at, updated_at")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration failed: {e}")
            raise

if __name__ == "__main__":
    print("Starting database migration...")
    print("This will update the persons table schema\n")
    
    response = input("Continue? (yes/no): ")
    if response.lower() == 'yes':
        migrate()
    else:
        print("Migration cancelled")
