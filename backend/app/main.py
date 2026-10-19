from fastapi import FastAPI
from app.routers import categories, records
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Pecker API",
    version="1.0.0"
)

# Inclusión de routers modularizados
app.include_router(categories.router)
app.include_router(records.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "API funcionando correctamente"}