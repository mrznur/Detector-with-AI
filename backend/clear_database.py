"""
Clear all data from the database
WARNING: This will delete ALL data!
"""
from sqlalchemy import text
from app.core.database import engine

def clear_database():
    print("⚠️  WARNING: This will delete ALL data from the database!")
    print("Tables that will be cleared:")
    print("  - presence_logs")
    print("  - face_embeddings")
    print("  - persons")
    print("  - cameras")
    print()
    
    response = input("Are you sure you want to continue? Type 'yes' to confirm: ")
    
    if response.lower() != 'yes':
        print("Operation cancelled")
        return
    
    with engine.connect() as conn:
        trans = conn.begin()
        
        try:
            print("\nClearing data...")
            
            # Delete in order to respect foreign key constraints
            print("Deleting presence_logs...")
            result = conn.execute(text("DELETE FROM presence_logs"))
            print(f"  ✓ Deleted {result.rowcount} logs")
            
            print("Deleting face_embeddings...")
            result = conn.execute(text("DELETE FROM face_embeddings"))
            print(f"  ✓ Deleted {result.rowcount} embeddings")
            
            print("Deleting persons...")
            result = conn.execute(text("DELETE FROM persons"))
            print(f"  ✓ Deleted {result.rowcount} persons")
            
            print("Deleting cameras...")
            result = conn.execute(text("DELETE FROM cameras"))
            print(f"  ✓ Deleted {result.rowcount} cameras")
            
            # Reset sequences
            print("\nResetting ID sequences...")
            conn.execute(text("ALTER SEQUENCE persons_id_seq RESTART WITH 1"))
            conn.execute(text("ALTER SEQUENCE cameras_id_seq RESTART WITH 1"))
            conn.execute(text("ALTER SEQUENCE face_embeddings_id_seq RESTART WITH 1"))
            conn.execute(text("ALTER SEQUENCE presence_logs_id_seq RESTART WITH 1"))
            print("  ✓ Sequences reset")
            
            trans.commit()
            print("\n✅ Database cleared successfully!")
            print("All data has been deleted and IDs reset to 1")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Error: {e}")
            raise

if __name__ == "__main__":
    clear_database()
