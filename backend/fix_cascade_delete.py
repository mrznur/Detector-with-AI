"""
Fix cascade delete for person deletion
This script ensures foreign key constraints are properly set up
"""
from sqlalchemy import text
from app.core.database import engine

def fix_cascade_delete():
    with engine.connect() as conn:
        # Drop existing foreign key constraints
        print("Dropping existing foreign key constraints...")
        
        # Face embeddings
        conn.execute(text("""
            ALTER TABLE face_embeddings 
            DROP CONSTRAINT IF EXISTS face_embeddings_person_id_fkey;
        """))
        
        # Presence logs
        conn.execute(text("""
            ALTER TABLE presence_logs 
            DROP CONSTRAINT IF EXISTS presence_logs_person_id_fkey;
        """))
        
        conn.commit()
        
        # Add new foreign key constraints with CASCADE DELETE
        print("Adding new foreign key constraints with CASCADE DELETE...")
        
        # Face embeddings
        conn.execute(text("""
            ALTER TABLE face_embeddings 
            ADD CONSTRAINT face_embeddings_person_id_fkey 
            FOREIGN KEY (person_id) 
            REFERENCES persons(id) 
            ON DELETE CASCADE;
        """))
        
        # Presence logs
        conn.execute(text("""
            ALTER TABLE presence_logs 
            ADD CONSTRAINT presence_logs_person_id_fkey 
            FOREIGN KEY (person_id) 
            REFERENCES persons(id) 
            ON DELETE CASCADE;
        """))
        
        conn.commit()
        
        print("✓ Cascade delete fixed successfully!")
        print("Now when you delete a person, all their face embeddings and presence logs will be automatically deleted.")

if __name__ == "__main__":
    fix_cascade_delete()
