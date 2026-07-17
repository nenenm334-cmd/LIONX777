from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# API Secret — if set, all KV endpoints require Bearer token
API_SECRET = os.environ.get('API_SECRET', '')
security = HTTPBearer(auto_error=False)

def verify_secret(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not API_SECRET:
        return  # no secret configured → open (dev mode)
    if not credentials or credentials.credentials != API_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized — invalid or missing API_SECRET")

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# =================== Models ===================
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class KVPutBody(BaseModel):
    # `value` is the raw string the frontend sends (already JSON-stringified by the app)
    value: Any


# =================== Health / Status ===================
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# =================== KV Store (Minbar backend) ===================
# Shared key-value storage backing window.storage.* on the client.
# Every teacher and student sees the same data.

KV_COLLECTION = "kv_store"


@api_router.get("/kv")
async def kv_list(prefix: Optional[str] = None, _=Depends(verify_secret)):
    """List all keys, optionally filtered by prefix."""
    query = {}
    if prefix:
        # Use regex to match prefix
        query["key"] = {"$regex": f"^{_regex_escape(prefix)}"}
    docs = await db[KV_COLLECTION].find(query, {"_id": 0, "key": 1}).to_list(10000)
    keys = [d["key"] for d in docs]
    return {"keys": keys, "prefix": prefix or ""}


@api_router.get("/kv/{key:path}")
async def kv_get(key: str, _=Depends(verify_secret)):
    doc = await db[KV_COLLECTION].find_one({"key": key}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Key not found: {key}")
    return {"key": doc["key"], "value": doc.get("value")}


@api_router.put("/kv/{key:path}")
async def kv_put(key: str, body: KVPutBody, _=Depends(verify_secret)):
    now = datetime.now(timezone.utc).isoformat()
    await db[KV_COLLECTION].update_one(
        {"key": key},
        {"$set": {"key": key, "value": body.value, "updated_at": now},
         "$setOnInsert": {"created_at": now}},
        upsert=True,
    )
    return {"key": key, "value": body.value}


@api_router.delete("/kv/{key:path}")
async def kv_delete(key: str, _=Depends(verify_secret)):
    res = await db[KV_COLLECTION].delete_one({"key": key})
    if res.deleted_count == 0:
        # Idempotent: return success even if it didn't exist
        return {"key": key, "deleted": False}
    return {"key": key, "deleted": True}


def _regex_escape(s: str) -> str:
    # Escape regex special chars for safe prefix match
    return "".join("\\" + c if c in r".^$*+?()[]{}|\\" else c for c in s)


# Include the router in the main app
app.include_router(api_router)

# =================== CORS ===================
# Explicit list of allowed origins (comma-separated in the CORS_ORIGINS env var on Railway).
# Falls back to a safe default that includes the Vercel production domain if the env var
# is not set. NOTE: allow_credentials=True cannot be combined with allow_origins=["*"],
# so we always use an explicit list here instead of "*".
_default_origins = "https://lionx-777.vercel.app,http://localhost:3000"
_origins_raw = os.environ.get('CORS_ORIGINS', _default_origins)
allow_origins = [o.strip() for o in _origins_raw.split(',') if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allow_origins,
    allow_origin_regex=r"https://lionx-777.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
