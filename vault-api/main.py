from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import init_db
from routers import audit_events, breach_events, emergency_lock, ledger, tokens, transactions, vendors


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Perimeter Vault API", lifespan=lifespan)

# Wildcard origin is fine here: auth is a header-based API key, not cookies,
# so there's no credentialed-request risk that wildcard CORS normally carries.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vendors.router)
app.include_router(tokens.router)
app.include_router(transactions.router)
app.include_router(breach_events.router)
app.include_router(ledger.router)
app.include_router(audit_events.router)
app.include_router(emergency_lock.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
