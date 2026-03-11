"""
Reset database - drops all tables and recreates them with new schema
WARNING: This will delete all data!
"""
from app.core.database import engine, Base
from app.models.person import Person
from app.models.camera import Camera
from app.models.face_embedding import FaceEmbedding
from app.models.presence_log import PresenceLog

def reset_database():
    print("⚠️  WARNING: This will delete ALL data in the database!")
    response = input("Are you sure you want to continue? (yes/no): ")
    
    if response.lower() != 'yes':
        print("Operation cancelled")
        return
    
    print("\nDropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("✅ All tables dropped")
    
    print("\nCreating tables with new schema...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created")
    
    print("\n✅ Database reset complete!")
    print("\nNew persons table schema:")
    print("- id (primary key)")
    print("- name (required)")
    print("- age (optional)")
    print("- gender (optional)")
    print("- employee_id (optional, unique)")
    print("- is_active (default: true)")
    print("- created_at")
    print("- updated_at")

if __name__ == "__main__":
    reset_database()
