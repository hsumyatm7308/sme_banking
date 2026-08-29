from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, transactions, dashboard, bank, loans
from seed import seed_data

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SME Banking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)
app.include_router(bank.router)
app.include_router(loans.router)


@app.on_event("startup")
def startup_event():
    seed_data()


@app.get("/")
def root():
    return {"message": "SME Banking API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
