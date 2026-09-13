from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    employees,
    leave,
    shift,
    timesheet,
    notification,
    analytics
)
app = FastAPI(
    title="AI-Powered Workforce Analytics & Talent Intelligence Dashboard API",
    description="Backend API using Amazon S3 Gold Layer",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Employee Management
app.include_router(
    employees.router
)

# Leave Management
app.include_router(
    leave.router
)

# Shift Management
app.include_router(
    shift.router
)

# Timesheet Management
app.include_router(
    timesheet.router
)

# Notifications
app.include_router(
    notification.router
)

# Workforce Analytics
app.include_router(
    analytics.router
)


@app.get("/")
async def home():
    return {
        "project": "AI-Powered Workforce Analytics & Talent Intelligence Dashboard",
        "version": "1.0.0",
        "status": "Running",
        "data_source": "Amazon S3 Gold Layer",
        "available_modules": [
            "Employee Management",
            "Leave Management",
            "Shift Management",
            "Timesheet Management",
            "Notifications",
            "Workforce Analytics"
        ]
    }