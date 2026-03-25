import firebase_admin
from firebase_admin import credentials, firestore

def clear_data():
    try:
        # Initialize without cert file if already initialized or using default creds
        if not firebase_admin._apps:
            firebase_admin.initialize_app()
        
        db = firestore.client()
        docs = db.collection('reservations').stream()
        
        count = 0
        for doc in docs:
            doc.reference.delete()
            count += 1
            print(f"Deleted: {doc.id}")
            
        print(f"--- SUCCESS: Total {count} reservations cleared ---")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    clear_data()
