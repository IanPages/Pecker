from fastapi import FastAPI
from app.routers import categories, records, goals
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="Pecker API",
    version="1.0.0"
)

# Inclusión de routers modularizados
app.include_router(categories.router)
app.include_router(records.router)
app.include_router(goals.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "API funcionando correctamente"}