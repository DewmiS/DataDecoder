from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from backend.routers import upload, profile, correlation

load_dotenv()

app = FastAPI(title="Explain My Data API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Server is running"}

app.include_router(upload.router, prefix="/api") 
app.include_router(profile.router, prefix="/api")
app.include_router(correlation.router, prefix="/api")
