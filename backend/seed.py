from datetime import date
from database import SessionLocal
from models import User, Transaction
from auth import get_password_hash


def seed_data():
    db = SessionLocal()

    existing_users = db.query(User).count()
    if existing_users > 0:
        print("Seed data already exists. Skipping...")
        db.close()
        return

    print("Seeding database...")

    users = [
        User(
            phone="09123456789",
            password_hash=get_password_hash("password123"),
            business_name="ABC Trading",
            owner_name="U Kyaw Moe",
            sector="Retail",
            role="sme_owner"
        ),
        User(
            phone="09987654321",
            password_hash=get_password_hash("admin123"),
            business_name="Bank Admin",
            owner_name="Daw Thin Thin",
            sector="Banking",
            role="bank_admin"
        ),
        User(
            phone="09111222333",
            password_hash=get_password_hash("password123"),
            business_name="XYZ Food Shop",
            owner_name="U Aung Aung",
            sector="Food",
            role="sme_owner"
        ),
    ]

    db.add_all(users)
    db.commit()

    transactions = [
        Transaction(user_id=1, type="income", amount=50000, category="Sales", date=date(2026, 8, 28)),
        Transaction(user_id=1, type="expense", amount=12000, category="Rent", date=date(2026, 8, 27)),
        Transaction(user_id=1, type="expense", amount=8000, category="Supplies", date=date(2026, 8, 26)),
        Transaction(user_id=1, type="income", amount=35000, category="Service Revenue", date=date(2026, 8, 25)),
        Transaction(user_id=1, type="expense", amount=45000, category="Salary", date=date(2026, 8, 24)),
        Transaction(user_id=1, type="income", amount=75000, category="Sales", date=date(2026, 8, 23)),
        Transaction(user_id=1, type="expense", amount=5000, category="Utilities", date=date(2026, 8, 22)),
        Transaction(user_id=1, type="expense", amount=15000, category="Marketing", date=date(2026, 8, 21)),
        Transaction(user_id=1, type="income", amount=60000, category="Sales", date=date(2026, 8, 20)),
        Transaction(user_id=1, type="expense", amount=10000, category="Transport", date=date(2026, 8, 19)),
        Transaction(user_id=1, type="income", amount=45000, category="Sales", date=date(2026, 7, 15)),
        Transaction(user_id=1, type="expense", amount=30000, category="Salary", date=date(2026, 7, 14)),
        Transaction(user_id=1, type="income", amount=55000, category="Service Revenue", date=date(2026, 7, 10)),
        Transaction(user_id=1, type="expense", amount=12000, category="Rent", date=date(2026, 7, 5)),
        Transaction(user_id=3, type="income", amount=40000, category="Sales", date=date(2026, 8, 28)),
        Transaction(user_id=3, type="expense", amount=20000, category="Supplies", date=date(2026, 8, 27)),
        Transaction(user_id=3, type="expense", amount=8000, category="Utilities", date=date(2026, 8, 26)),
        Transaction(user_id=3, type="income", amount=30000, category="Sales", date=date(2026, 8, 25)),
        Transaction(user_id=3, type="expense", amount=25000, category="Salary", date=date(2026, 8, 24)),
    ]

    db.add_all(transactions)
    db.commit()

    print(f"Created {len(users)} users and {len(transactions)} transactions")
    db.close()


if __name__ == "__main__":
    seed_data()
