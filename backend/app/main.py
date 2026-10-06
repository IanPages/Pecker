from fastapi import FastAPI
from app.routers import categories, records

app = FastAPI(
    title="Pecker API",
    version="1.0.0"
)

# Inclusión de routers modularizados
app.include_router(categories.router)
app.include_router(records.router)

@app.get("/")
async def root():
    return {"message": "API funcionando correctamente"}