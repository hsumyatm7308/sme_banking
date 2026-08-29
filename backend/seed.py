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
        User(
            phone="09222333444",
            password_hash=get_password_hash("password123"),
            business_name="Golden Restaurant",
            owner_name="Daw Mi Mi",
            sector="Food & Beverage",
            role="sme_owner"
        ),
        User(
            phone="09333444555",
            password_hash=get_password_hash("password123"),
            business_name="Shwe Electronics",
            owner_name="U Tun Tun",
            sector="Electronics",
            role="sme_owner"
        ),
        User(
            phone="09444555666",
            password_hash=get_password_hash("password123"),
            business_name="City Pharmacy",
            owner_name="Daw Sandar",
            sector="Healthcare",
            role="sme_owner"
        ),
        User(
            phone="09555666777",
            password_hash=get_password_hash("password123"),
            business_name="Myanmar Garment",
            owner_name="U Zaw Zaw",
            sector="Manufacturing",
            role="sme_owner"
        ),
        User(
            phone="09666777888",
            password_hash=get_password_hash("password123"),
            business_name="TechWave Solutions",
            owner_name="U Myo Myint",
            sector="Technology",
            role="sme_owner"
        ),
        User(
            phone="09777888999",
            password_hash=get_password_hash("password123"),
            business_name="Green Farm Organic",
            owner_name="Daw Khin Wine",
            sector="Agriculture",
            role="sme_owner"
        ),
        User(
            phone="09888999000",
            password_hash=get_password_hash("password123"),
            business_name="Royal Hotel",
            owner_name="U Thein Aung",
            sector="Hospitality",
            role="sme_owner"
        ),
    ]

    db.add_all(users)
    db.commit()

    # user_id=1  ABC Trading (Retail) — healthy business, low risk
    # user_id=3  XYZ Food Shop (Food) — moderate, medium risk
    # user_id=4  Golden Restaurant (F&B) — strong income, low risk
    # user_id=5  Shwe Electronics (Electronics) — high volume, low risk
    # user_id=6  City Pharmacy (Healthcare) — stable, low risk
    # user_id=7  Myanmar Garment (Manufacturing) — thin margins, medium risk
    # user_id=8  TechWave Solutions (Tech) — high growth, low risk
    # user_id=9  Green Farm Organic (Agriculture) — seasonal, medium risk
    # user_id=10 Royal Hotel (Hospitality) — struggling, high risk

    transactions = [
        # === ABC Trading (user_id=1) — Retail, healthy ===
        Transaction(user_id=1, type="income", amount=120000, category="Sales", date=date(2026, 8, 28)),
        Transaction(user_id=1, type="expense", amount=15000, category="Rent", date=date(2026, 8, 27)),
        Transaction(user_id=1, type="expense", amount=35000, category="Supplies", date=date(2026, 8, 26)),
        Transaction(user_id=1, type="income", amount=85000, category="Sales", date=date(2026, 8, 25)),
        Transaction(user_id=1, type="expense", amount=60000, category="Salary", date=date(2026, 8, 24)),
        Transaction(user_id=1, type="income", amount=95000, category="Sales", date=date(2026, 8, 23)),
        Transaction(user_id=1, type="expense", amount=8000, category="Utilities", date=date(2026, 8, 22)),
        Transaction(user_id=1, type="expense", amount=20000, category="Marketing", date=date(2026, 8, 21)),
        Transaction(user_id=1, type="income", amount=110000, category="Sales", date=date(2026, 8, 20)),
        Transaction(user_id=1, type="expense", amount=12000, category="Transport", date=date(2026, 8, 19)),
        Transaction(user_id=1, type="income", amount=90000, category="Sales", date=date(2026, 7, 15)),
        Transaction(user_id=1, type="expense", amount=60000, category="Salary", date=date(2026, 7, 14)),
        Transaction(user_id=1, type="income", amount=105000, category="Service Revenue", date=date(2026, 7, 10)),
        Transaction(user_id=1, type="expense", amount=15000, category="Rent", date=date(2026, 7, 5)),
        Transaction(user_id=1, type="income", amount=80000, category="Sales", date=date(2026, 6, 20)),
        Transaction(user_id=1, type="expense", amount=45000, category="Supplies", date=date(2026, 6, 18)),
        Transaction(user_id=1, type="income", amount=95000, category="Sales", date=date(2026, 6, 10)),
        Transaction(user_id=1, type="expense", amount=60000, category="Salary", date=date(2026, 6, 5)),

        # === XYZ Food Shop (user_id=3) — Food, moderate ===
        Transaction(user_id=3, type="income", amount=45000, category="Sales", date=date(2026, 8, 28)),
        Transaction(user_id=3, type="expense", amount=25000, category="Supplies", date=date(2026, 8, 27)),
        Transaction(user_id=3, type="expense", amount=10000, category="Utilities", date=date(2026, 8, 26)),
        Transaction(user_id=3, type="income", amount=38000, category="Sales", date=date(2026, 8, 25)),
        Transaction(user_id=3, type="expense", amount=30000, category="Salary", date=date(2026, 8, 24)),
        Transaction(user_id=3, type="income", amount=52000, category="Sales", date=date(2026, 8, 22)),
        Transaction(user_id=3, type="expense", amount=15000, category="Rent", date=date(2026, 8, 20)),
        Transaction(user_id=3, type="income", amount=40000, category="Sales", date=date(2026, 7, 20)),
        Transaction(user_id=3, type="expense", amount=30000, category="Salary", date=date(2026, 7, 15)),
        Transaction(user_id=3, type="income", amount=35000, category="Sales", date=date(2026, 7, 10)),

        # === Golden Restaurant (user_id=4) — F&B, strong ===
        Transaction(user_id=4, type="income", amount=180000, category="Sales", date=date(2026, 8, 28)),
        Transaction(user_id=4, type="expense", amount=45000, category="Supplies", date=date(2026, 8, 27)),
        Transaction(user_id=4, type="expense", amount=20000, category="Rent", date=date(2026, 8, 26)),
        Transaction(user_id=4, type="income", amount=155000, category="Sales", date=date(2026, 8, 25)),
        Transaction(user_id=4, type="expense", amount=80000, category="Salary", date=date(2026, 8, 24)),
        Transaction(user_id=4, type="income", amount=200000, category="Sales", date=date(2026, 8, 22)),
        Transaction(user_id=4, type="expense", amount=12000, category="Utilities", date=date(2026, 8, 20)),
        Transaction(user_id=4, type="income", amount=170000, category="Sales", date=date(2026, 7, 28)),
        Transaction(user_id=4, type="expense", amount=80000, category="Salary", date=date(2026, 7, 20)),
        Transaction(user_id=4, type="income", amount=160000, category="Sales", date=date(2026, 7, 15)),
        Transaction(user_id=4, type="expense", amount=40000, category="Supplies", date=date(2026, 7, 10)),
        Transaction(user_id=4, type="income", amount=190000, category="Service Revenue", date=date(2026, 6, 28)),

        # === Shwe Electronics (user_id=5) — Electronics, high volume ===
        Transaction(user_id=5, type="income", amount=350000, category="Sales", date=date(2026, 8, 28)),
        Transaction(user_id=5, type="expense", amount=200000, category="Supplies", date=date(2026, 8, 27)),
        Transaction(user_id=5, type="expense", amount=30000, category="Rent", date=date(2026, 8, 26)),
        Transaction(user_id=5, type="income", amount=280000, category="Sales", date=date(2026, 8, 24)),
        Transaction(user_id=5, type="expense", amount=50000, category="Salary", date=date(2026, 8, 22)),
        Transaction(user_id=5, type="income", amount=420000, category="Sales", date=date(2026, 8, 20)),
        Transaction(user_id=5, type="expense", amount=15000, category="Utilities", date=date(2026, 8, 18)),
        Transaction(user_id=5, type="expense", amount=25000, category="Transport", date=date(2026, 8, 16)),
        Transaction(user_id=5, type="income", amount=310000, category="Sales", date=date(2026, 7, 28)),
        Transaction(user_id=5, type="expense", amount=200000, category="Supplies", date=date(2026, 7, 25)),
        Transaction(user_id=5, type="income", amount=380000, category="Sales", date=date(2026, 7, 20)),
        Transaction(user_id=5, type="expense", amount=50000, category="Salary", date=date(2026, 7, 15)),

        # === City Pharmacy (user_id=6) — Healthcare, stable ===
        Transaction(user_id=6, type="income", amount=95000, category="Sales", date=date(2026, 8, 28)),
        Transaction(user_id=6, type="expense", amount=60000, category="Supplies", date=date(2026, 8, 27)),
        Transaction(user_id=6, type="expense", amount=12000, category="Rent", date=date(2026, 8, 25)),
        Transaction(user_id=6, type="income", amount=88000, category="Sales", date=date(2026, 8, 23)),
        Transaction(user_id=6, type="expense", amount=40000, category="Salary", date=date(2026, 8, 20)),
        Transaction(user_id=6, type="income", amount=102000, category="Sales", date=date(2026, 8, 18)),
        Transaction(user_id=6, type="expense", amount=8000, category="Utilities", date=date(2026, 8, 15)),
        Transaction(user_id=6, type="income", amount=91000, category="Sales", date=date(2026, 7, 28)),
        Transaction(user_id=6, type="expense", amount=40000, category="Salary", date=date(2026, 7, 20)),
        Transaction(user_id=6, type="income", amount=98000, category="Sales", date=date(2026, 7, 15)),

        # === Myanmar Garment (user_id=7) — Manufacturing, thin margins ===
        Transaction(user_id=7, type="income", amount=200000, category="Sales", date=date(2026, 8, 28)),
        Transaction(user_id=7, type="expense", amount=150000, category="Supplies", date=date(2026, 8, 27)),
        Transaction(user_id=7, type="expense", amount=25000, category="Rent", date=date(2026, 8, 25)),
        Transaction(user_id=7, type="income", amount=180000, category="Sales", date=date(2026, 8, 23)),
        Transaction(user_id=7, type="expense", amount=120000, category="Salary", date=date(2026, 8, 20)),
        Transaction(user_id=7, type="expense", amount=18000, category="Utilities", date=date(2026, 8, 18)),
        Transaction(user_id=7, type="income", amount=195000, category="Sales", date=date(2026, 7, 28)),
        Transaction(user_id=7, type="expense", amount=150000, category="Supplies", date=date(2026, 7, 25)),
        Transaction(user_id=7, type="income", amount=170000, category="Sales", date=date(2026, 7, 20)),

        # === TechWave Solutions (user_id=8) — Tech, high growth ===
        Transaction(user_id=8, type="income", amount=250000, category="Service Revenue", date=date(2026, 8, 28)),
        Transaction(user_id=8, type="expense", amount=80000, category="Salary", date=date(2026, 8, 27)),
        Transaction(user_id=8, type="expense", amount=15000, category="Rent", date=date(2026, 8, 25)),
        Transaction(user_id=8, type="income", amount=320000, category="Service Revenue", date=date(2026, 8, 23)),
        Transaction(user_id=8, type="expense", amount=80000, category="Salary", date=date(2026, 8, 20)),
        Transaction(user_id=8, type="income", amount=280000, category="Sales", date=date(2026, 8, 18)),
        Transaction(user_id=8, type="expense", amount=10000, category="Utilities", date=date(2026, 8, 15)),
        Transaction(user_id=8, type="expense", amount=35000, category="Marketing", date=date(2026, 8, 12)),
        Transaction(user_id=8, type="income", amount=200000, category="Service Revenue", date=date(2026, 7, 28)),
        Transaction(user_id=8, type="expense", amount=80000, category="Salary", date=date(2026, 7, 20)),
        Transaction(user_id=8, type="income", amount=180000, category="Service Revenue", date=date(2026, 7, 10)),

        # === Green Farm Organic (user_id=9) — Agriculture, seasonal ===
        Transaction(user_id=9, type="income", amount=60000, category="Sales", date=date(2026, 8, 28)),
        Transaction(user_id=9, type="expense", amount=35000, category="Supplies", date=date(2026, 8, 26)),
        Transaction(user_id=9, type="expense", amount=8000, category="Transport", date=date(2026, 8, 24)),
        Transaction(user_id=9, type="income", amount=45000, category="Sales", date=date(2026, 8, 20)),
        Transaction(user_id=9, type="expense", amount=15000, category="Salary", date=date(2026, 8, 18)),
        Transaction(user_id=9, type="expense", amount=5000, category="Utilities", date=date(2026, 8, 15)),
        Transaction(user_id=9, type="income", amount=80000, category="Sales", date=date(2026, 7, 28)),
        Transaction(user_id=9, type="expense", amount=40000, category="Supplies", date=date(2026, 7, 20)),
        Transaction(user_id=9, type="income", amount=55000, category="Sales", date=date(2026, 7, 10)),

        # === Royal Hotel (user_id=10) — Hospitality, struggling (high risk) ===
        Transaction(user_id=10, type="income", amount=30000, category="Sales", date=date(2026, 8, 28)),
        Transaction(user_id=10, type="expense", amount=45000, category="Rent", date=date(2026, 8, 27)),
        Transaction(user_id=10, type="expense", amount=40000, category="Salary", date=date(2026, 8, 25)),
        Transaction(user_id=10, type="income", amount=25000, category="Sales", date=date(2026, 8, 20)),
        Transaction(user_id=10, type="expense", amount=12000, category="Utilities", date=date(2026, 8, 18)),
        Transaction(user_id=10, type="expense", amount=8000, category="Marketing", date=date(2026, 8, 15)),
        Transaction(user_id=10, type="income", amount=20000, category="Sales", date=date(2026, 7, 28)),
        Transaction(user_id=10, type="expense", amount=45000, category="Rent", date=date(2026, 7, 25)),
        Transaction(user_id=10, type="expense", amount=40000, category="Salary", date=date(2026, 7, 20)),
    ]

    db.add_all(transactions)
    db.commit()

    print(f"Created {len(users)} users and {len(transactions)} transactions")
    db.close()


if __name__ == "__main__":
    seed_data()
