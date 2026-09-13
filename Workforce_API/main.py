from fastapi import FastAPI, UploadFile, File, HTTPException
import pandas as pd
import boto3
from botocore.exceptions import ClientError
from io import BytesIO
from pydantic import BaseModel

app = FastAPI(
    title="Workforce Analytics API",
    description="Upload and access workforce dataset stored in Amazon S3",
    version="2.0.0"
)

class ChatRequest(BaseModel):
    question: str
# ==========================
# AWS Configuration
# ==========================

BUCKET_NAME = "nithish-datalake-2026"

BRONZE_FILE = "kalash/bronze/workforce.csv"
SILVER_FILE = "kalash/silver/workforce_clean.csv"

DEPARTMENT_SUMMARY = "kalash/gold/department_summary.csv"
JOB_ROLE_SUMMARY = "kalash/gold/job_role_summary.csv"
ATTRITION_SUMMARY = "kalash/gold/attrition_summary.csv"
GENDER_SUMMARY = "kalash/gold/gender_summary.csv"
SALARY_SUMMARY = "kalash/gold/salary_summary.csv"

s3 = boto3.client("s3")


# ==========================
# Helper Functions
# ==========================

def load_csv(file_key):
    try:
        response = s3.get_object(
            Bucket=BUCKET_NAME,
            Key=file_key
        )

        return pd.read_csv(response["Body"])

    except ClientError as e:

        if e.response["Error"]["Code"] == "NoSuchKey":
            return None

        raise


def load_dataset():
    return load_csv(SILVER_FILE)


# ==========================
# Basic APIs
# ==========================

@app.get("/")
def home():

    return {
        "message": "Workforce Analytics API is running!",
        "status": "Healthy"
    }


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file."
        )

    try:

        contents = await file.read()

        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=BRONZE_FILE,
            Body=contents,
            ContentType="text/csv"
        )

        df = pd.read_csv(BytesIO(contents))
        df = df.fillna("")

        return {
            "message": "Dataset uploaded successfully!",
            "filename": file.filename,
            "rows": len(df),
            "columns": list(df.columns)
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================
# Attendance APIs
# ==========================

ATTENDANCE_COLUMNS = [
    "employee_id",
    "employee_name",
    "attendance_date",
    "attendance_status",
    "check_in",
    "check_out",
    "late_minutes",
    "working_hours",
    "gps_checkin",
    "face_recognition",
    "biometric_status",
    "qr_checkin",
    "shift_type",
    "overtime_hours"
]


@app.get("/attendance")
def attendance():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    # Check that required columns exist
    missing_columns = [
        column for column in ATTENDANCE_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Attendance columns missing from dataset.",
                "missing_columns": missing_columns
            }
        )

    attendance_df = df[ATTENDANCE_COLUMNS]

    attendance_df = attendance_df.where(
        pd.notnull(attendance_df),
        None
    )

    return {
        "total_records": len(attendance_df),
        "data": attendance_df.to_dict(orient="records")
    }

@app.get("/attendance-summary")
def attendance_summary():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "attendance_status",
        "late_minutes",
        "working_hours",
        "overtime_hours"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Required attendance columns missing.",
                "missing_columns": missing_columns
            }
        )

    total_records = len(df)

    # Normalize attendance status
    status = (
        df["attendance_status"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    present = int((status == "present").sum())
    absent = int((status == "absent").sum())
    late = int(
        (
            pd.to_numeric(
                df["late_minutes"],
                errors="coerce"
            ).fillna(0) > 0
        ).sum()
    )
    wfh = int((status == "wfh").sum())

    working_hours = pd.to_numeric(
        df["working_hours"],
        errors="coerce"
    )

    overtime_hours = pd.to_numeric(
        df["overtime_hours"],
        errors="coerce"
    )

    attendance_rate = 0

    if total_records > 0:
        attendance_rate = round(
            ((present + wfh) / total_records) * 100,
            2
        )

    return {
        "total_records": total_records,
        "present": present,
        "absent": absent,
        "late": late,
        "wfh": wfh,
        "attendance_rate": attendance_rate,
        "average_working_hours": round(
            working_hours.mean(),
            2
        ),
        "total_overtime_hours": round(
            overtime_hours.sum(),
            2
        )
    }

@app.get("/attendance/department-summary")
def attendance_department_summary():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "department",
        "attendance_status",
        "working_hours",
        "overtime_hours"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Required attendance columns missing.",
                "missing_columns": missing_columns
            }
        )

    df["attendance_status"] = (
        df["attendance_status"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    df["working_hours"] = pd.to_numeric(
        df["working_hours"],
        errors="coerce"
    )

    df["overtime_hours"] = pd.to_numeric(
        df["overtime_hours"],
        errors="coerce"
    )

    results = []

    for department, group in df.groupby("department"):

        total_records = len(group)

        present = int(
            (group["attendance_status"] == "present").sum()
        )

        absent = int(
            (group["attendance_status"] == "absent").sum()
        )

        wfh = int(
            (group["attendance_status"] == "wfh").sum()
        )

        attendance_rate = 0

        if total_records > 0:
            attendance_rate = round(
                ((present + wfh) / total_records) * 100,
                2
            )

        results.append({
            "department": department,
            "total_records": total_records,
            "present": present,
            "absent": absent,
            "wfh": wfh,
            "attendance_rate": attendance_rate,
            "average_working_hours": round(
                group["working_hours"].mean(),
                2
            ),
            "total_overtime_hours": round(
                group["overtime_hours"].sum(),
                2
            )
        })

    return {
        "total_departments": len(results),
        "data": results
    }

@app.get("/attendance/late-employees")
def late_employees():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "employee_name",
        "attendance_date",
        "attendance_status",
        "late_minutes",
        "check_in",
        "check_out",
        "working_hours",
        "department",
        "shift_type"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Required attendance columns missing.",
                "missing_columns": missing_columns
            }
        )

    df["late_minutes"] = pd.to_numeric(
        df["late_minutes"],
        errors="coerce"
    ).fillna(0)

    late_df = df[df["late_minutes"] > 0]

    late_df = late_df[required_columns]

    late_df = late_df.where(
        pd.notnull(late_df),
        None
    )

    return {
        "total_late_records": len(late_df),
        "data": late_df.to_dict(orient="records")
    }

@app.get("/attendance/{employee_id}")
def attendance_by_employee(employee_id: str):

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    missing_columns = [
        column
        for column in ATTENDANCE_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Attendance columns missing from dataset.",
                "missing_columns": missing_columns
            }
        )

    # Find employee
    employee_df = df[
        df["employee_id"].astype(str).str.strip() == employee_id.strip()
    ]

    if employee_df.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Employee {employee_id} not found."
        )

    employee_df = employee_df[ATTENDANCE_COLUMNS]

    employee_df = employee_df.where(
        pd.notnull(employee_df),
        None
    )

    return {
        "employee_id": employee_id,
        "total_records": len(employee_df),
        "data": employee_df.to_dict(orient="records")
    }


# ==========================
# Payroll APIs
# ==========================

PAYROLL_COLUMNS = [
    "employee_id",
    "employee_name",
    "department",
    "job_role",
    "basic_salary",
    "bonus",
    "deduction",
    "net_salary"
]


@app.get("/payroll")
def payroll():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    missing_columns = [
        column
        for column in PAYROLL_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Payroll columns missing from dataset.",
                "missing_columns": missing_columns
            }
        )

    payroll_df = df[PAYROLL_COLUMNS].copy()

    numeric_columns = [
        "basic_salary",
        "bonus",
        "deduction",
        "net_salary"
    ]

    for column in numeric_columns:
        payroll_df[column] = pd.to_numeric(
            payroll_df[column],
            errors="coerce"
        )

    payroll_df = payroll_df.where(
        pd.notnull(payroll_df),
        None
    )

    return {
        "total_records": len(payroll_df),
        "data": payroll_df.to_dict(orient="records")
    }

@app.get("/payroll-summary")
def payroll_summary():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "basic_salary",
        "bonus",
        "deduction",
        "net_salary"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Required payroll columns missing.",
                "missing_columns": missing_columns
            }
        )

    basic_salary = pd.to_numeric(
        df["basic_salary"],
        errors="coerce"
    )

    bonus = pd.to_numeric(
        df["bonus"],
        errors="coerce"
    )

    deduction = pd.to_numeric(
        df["deduction"],
        errors="coerce"
    )

    net_salary = pd.to_numeric(
        df["net_salary"],
        errors="coerce"
    )

    return {
        "total_employees": int(
            df["employee_id"].nunique()
        ),

        "total_basic_salary": float(
            round(basic_salary.sum(), 2)
        ),

        "total_bonus": float(
            round(bonus.sum(), 2)
        ),

        "total_deductions": float(
            round(deduction.sum(), 2)
        ),

        "total_net_salary": float(
            round(net_salary.sum(), 2)
        ),

        "average_basic_salary": float(
            round(basic_salary.mean(), 2)
        ),

        "average_net_salary": float(
            round(net_salary.mean(), 2)
        )
    }

@app.get("/payroll/department-summary")
def payroll_department_summary():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "department",
        "basic_salary",
        "bonus",
        "deduction",
        "net_salary"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Required payroll columns missing.",
                "missing_columns": missing_columns
            }
        )

    payroll_df = df[required_columns].copy()

    numeric_columns = [
        "basic_salary",
        "bonus",
        "deduction",
        "net_salary"
    ]

    for column in numeric_columns:
        payroll_df[column] = pd.to_numeric(
            payroll_df[column],
            errors="coerce"
        )

    results = []

    for department, group in payroll_df.groupby("department"):

        results.append({
            "department": department,
            "employee_count": int(len(group)),
            "total_basic_salary": float(
                round(group["basic_salary"].sum(), 2)
            ),
            "total_bonus": float(
                round(group["bonus"].sum(), 2)
            ),
            "total_deductions": float(
                round(group["deduction"].sum(), 2)
            ),
            "total_net_salary": float(
                round(group["net_salary"].sum(), 2)
            ),
            "average_basic_salary": float(
                round(group["basic_salary"].mean(), 2)
            ),
            "average_net_salary": float(
                round(group["net_salary"].mean(), 2)
            )
        })

    return {
        "total_departments": len(results),
        "data": results
    }



@app.get("/payroll/{employee_id}")
def payroll_by_employee(employee_id: str):

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    missing_columns = [
        column
        for column in PAYROLL_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Payroll columns missing from dataset.",
                "missing_columns": missing_columns
            }
        )

    employee_df = df[
        df["employee_id"].astype(str).str.strip()
        == employee_id.strip()
    ]

    if employee_df.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Employee {employee_id} not found."
        )

    employee_df = employee_df[PAYROLL_COLUMNS].copy()

    numeric_columns = [
        "basic_salary",
        "bonus",
        "deduction",
        "net_salary"
    ]

    for column in numeric_columns:
        employee_df[column] = pd.to_numeric(
            employee_df[column],
            errors="coerce"
        )

    employee_df = employee_df.where(
        pd.notnull(employee_df),
        None
    )

    return {
        "employee_id": employee_id,
        "total_records": len(employee_df),
        "data": employee_df.to_dict(orient="records")
    }

# ==========================
# Performance APIs
# ==========================

PERFORMANCE_COLUMNS = [
    "employee_id",
    "employee_name",
    "department",
    "job_role",
    "kpi_score",
    "goal_completion_percent",
    "productivity_score",
    "performance_rating",
    "training_hours",
    "skill",
    "skill_gap_score",
    "engagement_score",
    "sentiment"
]


@app.get("/performance")
def performance():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    missing_columns = [
        column
        for column in PERFORMANCE_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Performance columns missing from dataset.",
                "missing_columns": missing_columns
            }
        )

    performance_df = df[PERFORMANCE_COLUMNS].copy()

    numeric_columns = [
        "kpi_score",
        "goal_completion_percent",
        "productivity_score",
        "performance_rating",
        "training_hours",
        "skill_gap_score",
        "engagement_score"
    ]

    for column in numeric_columns:
        performance_df[column] = pd.to_numeric(
            performance_df[column],
            errors="coerce"
        )

    performance_df = performance_df.where(
        pd.notnull(performance_df),
        None
    )

    return {
        "total_records": len(performance_df),
        "data": performance_df.to_dict(orient="records")
    }

@app.get("/performance-summary")
def performance_summary():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "kpi_score",
        "goal_completion_percent",
        "productivity_score",
        "performance_rating",
        "training_hours",
        "skill_gap_score",
        "engagement_score",
        "sentiment"
    ]

    missing_columns = [
        col for col in required_columns
        if col not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Required performance columns missing.",
                "missing_columns": missing_columns
            }
        )

    numeric_columns = [
        "kpi_score",
        "goal_completion_percent",
        "productivity_score",
        "performance_rating",
        "training_hours",
        "skill_gap_score",
        "engagement_score"
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    sentiment = (
        df["sentiment"]
        .astype(str)
        .str.strip()
        .str.title()
    )

    return {
        "total_employees": int(df["employee_id"].nunique()),

        "average_kpi_score": float(
            round(df["kpi_score"].mean(), 2)
        ),

        "average_goal_completion": float(
            round(df["goal_completion_percent"].mean(), 2)
        ),

        "average_productivity_score": float(
            round(df["productivity_score"].mean(), 2)
        ),

        "average_performance_rating": float(
            round(df["performance_rating"].mean(), 2)
        ),

        "average_training_hours": float(
            round(df["training_hours"].mean(), 2)
        ),

        "average_skill_gap_score": float(
            round(df["skill_gap_score"].mean(), 2)
        ),

        "average_engagement_score": float(
            round(df["engagement_score"].mean(), 2)
        ),

        "positive_sentiment": int(
            (sentiment == "Positive").sum()
        ),

        "neutral_sentiment": int(
            (sentiment == "Neutral").sum()
        ),

        "negative_sentiment": int(
            (sentiment == "Negative").sum()
        )
    }

@app.get("/performance/department-summary")
def performance_department_summary():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "department",
        "kpi_score",
        "goal_completion_percent",
        "productivity_score",
        "performance_rating",
        "training_hours",
        "skill_gap_score",
        "engagement_score"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Required performance columns missing.",
                "missing_columns": missing_columns
            }
        )

    performance_df = df[required_columns].copy()

    numeric_columns = [
        "kpi_score",
        "goal_completion_percent",
        "productivity_score",
        "performance_rating",
        "training_hours",
        "skill_gap_score",
        "engagement_score"
    ]

    for column in numeric_columns:
        performance_df[column] = pd.to_numeric(
            performance_df[column],
            errors="coerce"
        )

    results = []

    for department, group in performance_df.groupby("department"):

        results.append({

            "department": department,

            "employee_count": int(len(group)),

            "average_kpi_score": float(
                round(group["kpi_score"].mean(), 2)
            ),

            "average_goal_completion": float(
                round(group["goal_completion_percent"].mean(), 2)
            ),

            "average_productivity_score": float(
                round(group["productivity_score"].mean(), 2)
            ),

            "average_performance_rating": float(
                round(group["performance_rating"].mean(), 2)
            ),

            "average_training_hours": float(
                round(group["training_hours"].mean(), 2)
            ),

            "average_skill_gap_score": float(
                round(group["skill_gap_score"].mean(), 2)
            ),

            "average_engagement_score": float(
                round(group["engagement_score"].mean(), 2)
            )

        })

    return {
        "total_departments": len(results),
        "data": results
    }

# @app.get("/performance/low-performers")
# def low_performers():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "employee_name",
        "department",
        "job_role",
        "kpi_score",
        "performance_rating",
        "productivity_score",
        "skill_gap_score",
        "engagement_score",
        "sentiment"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Required performance columns missing.",
                "missing_columns": missing_columns
            }
        )

    performance_df = df[required_columns].copy()

    numeric_columns = [
        "kpi_score",
        "performance_rating",
        "productivity_score",
        "skill_gap_score",
        "engagement_score"
    ]

    for column in numeric_columns:
        performance_df[column] = pd.to_numeric(
            performance_df[column],
            errors="coerce"
        )

    low_df = performance_df[
        (performance_df["kpi_score"] < 50) |
        (performance_df["performance_rating"] <= 2) |
        (performance_df["productivity_score"] < 50) |
        (performance_df["skill_gap_score"] > 70)
    ]

    low_df = low_df.where(
        pd.notnull(low_df),
        None
    )

    return {
        "total_low_performers": int(len(low_df)),
        "data": low_df.to_dict(orient="records")
    }
@app.get("/performance/{employee_id}")
def performance_by_employee(employee_id: str):

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    missing_columns = [
        column
        for column in PERFORMANCE_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Performance columns missing from dataset.",
                "missing_columns": missing_columns
            }
        )

    employee_df = df[
        df["employee_id"].astype(str).str.strip()
        == employee_id.strip()
    ]

    if employee_df.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Employee {employee_id} not found."
        )

    employee_df = employee_df[PERFORMANCE_COLUMNS].copy()

    numeric_columns = [
        "kpi_score",
        "goal_completion_percent",
        "productivity_score",
        "performance_rating",
        "training_hours",
        "skill_gap_score",
        "engagement_score"
    ]

    for column in numeric_columns:
        employee_df[column] = pd.to_numeric(
            employee_df[column],
            errors="coerce"
        )

    employee_df = employee_df.where(
        pd.notnull(employee_df),
        None
    )

    return {
        "employee_id": employee_id,
        "total_records": len(employee_df),
        "data": employee_df.to_dict(orient="records")
    }


# ==========================
# Workforce Planning APIs
# ==========================

WORKFORCE_COLUMNS = [
    "employee_id",
    "employee_name",
    "department",
    "job_role",
    "attrition_status",
    "attrition_risk_score",
    "absenteeism_risk",
    "workforce_forecast_need",
    "manager_alert",
    "hr_alert"
]


@app.get("/workforce-planning")
def workforce_planning():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    missing_columns = [
        c for c in WORKFORCE_COLUMNS
        if c not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Required workforce columns missing.",
                "missing_columns": missing_columns
            }
        )

    workforce_df = df[WORKFORCE_COLUMNS].copy()

    numeric_columns = [
        "attrition_risk_score",
        "absenteeism_risk"
    ]

    for column in numeric_columns:
        workforce_df[column] = pd.to_numeric(
            workforce_df[column],
            errors="coerce"
        )

    workforce_df = workforce_df.where(
        pd.notnull(workforce_df),
        None
    )

    return {
        "total_records": len(workforce_df),
        "data": workforce_df.to_dict(orient="records")
    }

@app.get("/workforce-summary")
def workforce_summary():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "attrition_status",
        "attrition_risk_score",
        "absenteeism_risk",
        "workforce_forecast_need",
        "manager_alert",
        "hr_alert"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Required workforce columns missing.",
                "missing_columns": missing_columns
            }
        )

    df["attrition_risk_score"] = pd.to_numeric(
        df["attrition_risk_score"],
        errors="coerce"
    )

    df["absenteeism_risk"] = pd.to_numeric(
        df["absenteeism_risk"],
        errors="coerce"
    )

    attrition_status = (
        df["attrition_status"]
        .astype(str)
        .str.strip()
        .str.title()
    )

    forecast = (
        df["workforce_forecast_need"]
        .astype(str)
        .str.strip()
        .str.title()
    )

    manager_alert = (
        df["manager_alert"]
        .astype(str)
        .str.strip()
        .str.title()
    )

    hr_alert = (
        df["hr_alert"]
        .astype(str)
        .str.strip()
        .str.title()
    )

    return {

        "total_employees": int(
            df["employee_id"].nunique()
        ),

        "high_attrition_risk": int(
            (df["attrition_risk_score"] >= 70).sum()
        ),

        "medium_attrition_risk": int(
            (
                (df["attrition_risk_score"] >= 40) &
                (df["attrition_risk_score"] < 70)
            ).sum()
        ),

        "low_attrition_risk": int(
            (df["attrition_risk_score"] < 40).sum()
        ),

        "high_absenteeism_risk": int(
            (df["absenteeism_risk"] >= 70).sum()
        ),

        "employees_with_attrition": int(
            (attrition_status == "Yes").sum()
        ),

        "forecast_hiring_needed": int(
            (forecast == "Hiring Needed").sum()
        ),

        "manager_alerts": int(
            (manager_alert == "Yes").sum()
        ),

        "hr_alerts": int(
            (hr_alert == "Yes").sum()
        )
    }



@app.get("/workforce-planning/{employee_id}")
def workforce_employee(employee_id: str):

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    missing_columns = [
        column
        for column in WORKFORCE_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Required workforce columns missing.",
                "missing_columns": missing_columns
            }
        )

    employee_df = df[
        df["employee_id"].astype(str).str.strip()
        == employee_id.strip()
    ]

    if employee_df.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Employee {employee_id} not found."
        )

    employee_df = employee_df[WORKFORCE_COLUMNS].copy()

    numeric_columns = [
        "attrition_risk_score",
        "absenteeism_risk"
    ]

    for column in numeric_columns:
        employee_df[column] = pd.to_numeric(
            employee_df[column],
            errors="coerce"
        )

    employee_df = employee_df.where(
        pd.notnull(employee_df),
        None
    )

    return {
        "employee_id": employee_id,
        "total_records": len(employee_df),
        "data": employee_df.to_dict(orient="records")
    }


# ==========================
# Dashboard API
# ==========================

@app.get("/dashboard")
def dashboard():

    employee_df = load_dataset()

    department_df = load_csv(DEPARTMENT_SUMMARY)
    job_role_df = load_csv(JOB_ROLE_SUMMARY)
    attrition_df = load_csv(ATTRITION_SUMMARY)
    gender_df = load_csv(GENDER_SUMMARY)
    salary_df = load_csv(SALARY_SUMMARY)

    if (
        employee_df is None
        or department_df is None
        or job_role_df is None
        or attrition_df is None
        or gender_df is None
        or salary_df is None
    ):
        return {
            "message": "Dashboard data not available."
        }

    # Convert salary column to numeric
    salary = pd.to_numeric(
        employee_df["basic_salary"],
        errors="coerce"
    )

    return {

        "total_employees": len(employee_df),

        "total_departments": int(
            employee_df["department"].nunique()
        ),

        "total_job_roles": int(
            employee_df["job_role"].nunique()
        ),

        "average_basic_salary": round(
            salary.mean(),
            2
        ),

        "department_summary":
            department_df.to_dict(orient="records"),

        "job_role_summary":
            job_role_df.to_dict(orient="records"),

        "attrition_summary":
            attrition_df.to_dict(orient="records"),

        "gender_summary":
            gender_df.to_dict(orient="records"),

        "salary_summary":
            salary_df.to_dict(orient="records")
    }

    employee_df = load_dataset()

    department_df = load_csv(DEPARTMENT_SUMMARY)
    job_role_df = load_csv(JOB_ROLE_SUMMARY)
    attrition_df = load_csv(ATTRITION_SUMMARY)
    gender_df = load_csv(GENDER_SUMMARY)
    salary_df = load_csv(SALARY_SUMMARY)

    if (
        employee_df is None
        or department_df is None
        or job_role_df is None
        or attrition_df is None
        or gender_df is None
        or salary_df is None
    ):

        return {
            "message": "Dashboard data not available."
        }

    return {

        "total_employees": len(employee_df),

        "total_departments": int(employee_df["department"].nunique()),

        "total_job_roles": int(employee_df["job_role"].nunique()),

        "average_salary": round(
            employee_df["monthly_income"].astype(float).mean(),
            2
        ),

        "department_summary":
            department_df.to_dict(orient="records"),

        "job_role_summary":
            job_role_df.to_dict(orient="records"),

        "attrition_summary":
            attrition_df.to_dict(orient="records"),

        "gender_summary":
            gender_df.to_dict(orient="records"),

        "salary_summary":
            salary_df.to_dict(orient="records")

    }

# Report APIS

@app.get("/reports/dashboard")
def dashboard_report():

    df = load_dataset()

    department_df = load_csv(DEPARTMENT_SUMMARY)
    job_role_df = load_csv(JOB_ROLE_SUMMARY)
    attrition_df = load_csv(ATTRITION_SUMMARY)
    gender_df = load_csv(GENDER_SUMMARY)
    salary_df = load_csv(SALARY_SUMMARY)

    if (
        df is None
        or department_df is None
        or job_role_df is None
        or attrition_df is None
        or gender_df is None
        or salary_df is None
    ):
        return {
            "message": "Report data not available."
        }

    df["basic_salary"] = pd.to_numeric(
        df["basic_salary"],
        errors="coerce"
    )

    report = {

        "report_name": "Executive Workforce Dashboard",

        "generated_on": pd.Timestamp.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "summary": {

            "total_employees": int(
                df["employee_id"].nunique()
            ),

            "departments": int(
                df["department"].nunique()
            ),

            "job_roles": int(
                df["job_role"].nunique()
            ),

            "average_basic_salary": float(
                round(df["basic_salary"].mean(), 2)
            )

        },

        "department_summary":
            department_df.to_dict(orient="records"),

        "job_role_summary":
            job_role_df.to_dict(orient="records"),

        "attrition_summary":
            attrition_df.to_dict(orient="records"),

        "gender_summary":
            gender_df.to_dict(orient="records"),

        "salary_summary":
            salary_df.to_dict(orient="records")
    }

    return report


@app.get("/reports/attendance")
def attendance_report():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "employee_name",
        "department",
        "attendance_date",
        "attendance_status",
        "late_minutes",
        "working_hours",
        "shift_type",
        "overtime_hours"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Attendance columns missing.",
                "missing_columns": missing_columns
            }
        )

    attendance_df = df[required_columns].copy()

    attendance_df["late_minutes"] = pd.to_numeric(
        attendance_df["late_minutes"],
        errors="coerce"
    )

    attendance_df["working_hours"] = pd.to_numeric(
        attendance_df["working_hours"],
        errors="coerce"
    )

    attendance_df["overtime_hours"] = pd.to_numeric(
        attendance_df["overtime_hours"],
        errors="coerce"
    )

    status = (
        attendance_df["attendance_status"]
        .astype(str)
        .str.strip()
        .str.title()
    )

    report = {

        "report_name": "Attendance Report",

        "generated_on": pd.Timestamp.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "summary": {

            "total_records": int(len(attendance_df)),

            "present": int(
                (status == "Present").sum()
            ),

            "absent": int(
                (status == "Absent").sum()
            ),

            "wfh": int(
                (status == "Wfh").sum()
            ),

            "late_employees": int(
                (attendance_df["late_minutes"] > 0).sum()
            ),

            "average_working_hours": float(
                round(
                    attendance_df["working_hours"].mean(),
                    2
                )
            ),

            "total_overtime_hours": float(
                round(
                    attendance_df["overtime_hours"].sum(),
                    2
                )
            )

        },

        "records":
            attendance_df.where(
                pd.notnull(attendance_df),
                None
            ).to_dict(orient="records")
    }

    return report

@app.get("/reports/payroll")
def payroll_report():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "employee_name",
        "department",
        "job_role",
        "basic_salary",
        "bonus",
        "deduction",
        "net_salary"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Payroll columns missing.",
                "missing_columns": missing_columns
            }
        )

    payroll_df = df[required_columns].copy()

    numeric_columns = [
        "basic_salary",
        "bonus",
        "deduction",
        "net_salary"
    ]

    for column in numeric_columns:
        payroll_df[column] = pd.to_numeric(
            payroll_df[column],
            errors="coerce"
        )

    report = {

        "report_name": "Payroll Report",

        "generated_on": pd.Timestamp.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "summary": {

            "total_employees": int(len(payroll_df)),

            "total_basic_salary": float(
                round(payroll_df["basic_salary"].sum(), 2)
            ),

            "total_bonus": float(
                round(payroll_df["bonus"].sum(), 2)
            ),

            "total_deductions": float(
                round(payroll_df["deduction"].sum(), 2)
            ),

            "total_net_salary": float(
                round(payroll_df["net_salary"].sum(), 2)
            ),

            "average_basic_salary": float(
                round(payroll_df["basic_salary"].mean(), 2)
            ),

            "average_net_salary": float(
                round(payroll_df["net_salary"].mean(), 2)
            )

        },

        "records":
            payroll_df.where(
                pd.notnull(payroll_df),
                None
            ).to_dict(orient="records")

    }

    return report


@app.get("/reports/workforce")
def workforce_report():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "employee_name",
        "department",
        "job_role",
        "attrition_status",
        "attrition_risk_score",
        "absenteeism_risk",
        "workforce_forecast_need",
        "manager_alert",
        "hr_alert"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Workforce columns missing.",
                "missing_columns": missing_columns
            }
        )

    workforce_df = df[required_columns].copy()

    workforce_df["attrition_risk_score"] = pd.to_numeric(
        workforce_df["attrition_risk_score"],
        errors="coerce"
    )

    workforce_df["absenteeism_risk"] = pd.to_numeric(
        workforce_df["absenteeism_risk"],
        errors="coerce"
    )

    attrition = (
        workforce_df["attrition_status"]
        .astype(str)
        .str.strip()
        .str.title()
    )

    forecast = (
        workforce_df["workforce_forecast_need"]
        .astype(str)
        .str.strip()
        .str.title()
    )

    manager = (
        workforce_df["manager_alert"]
        .astype(str)
        .str.strip()
        .str.title()
    )

    hr = (
        workforce_df["hr_alert"]
        .astype(str)
        .str.strip()
        .str.title()
    )

    report = {

        "report_name": "AI Workforce Planning Report",

        "generated_on": pd.Timestamp.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "summary": {

            "total_employees": int(
                workforce_df["employee_id"].nunique()
            ),

            "high_attrition_risk": int(
                (workforce_df["attrition_risk_score"] >= 70).sum()
            ),

            "medium_attrition_risk": int(
                (
                    (workforce_df["attrition_risk_score"] >= 40) &
                    (workforce_df["attrition_risk_score"] < 70)
                ).sum()
            ),

            "low_attrition_risk": int(
                (workforce_df["attrition_risk_score"] < 40).sum()
            ),

            "high_absenteeism_risk": int(
                (workforce_df["absenteeism_risk"] >= 70).sum()
            ),

            "employees_with_attrition": int(
                (attrition == "Yes").sum()
            ),

            "forecast_hiring_needed": int(
                (forecast == "Hiring Needed").sum()
            ),

            "manager_alerts": int(
                (manager == "Yes").sum()
            ),

            "hr_alerts": int(
                (hr == "Yes").sum()
            )

        },

        "records":
            workforce_df.where(
                pd.notnull(workforce_df),
                None
            ).to_dict(orient="records")

    }

    return report

@app.get("/reports/attendance/daily")
def daily_attendance_report():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "attendance_date",
        "attendance_status",
        "late_minutes",
        "working_hours",
        "overtime_hours"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Attendance columns missing.",
                "missing_columns": missing_columns
            }
        )

    attendance_df = df[required_columns].copy()

    attendance_df["late_minutes"] = pd.to_numeric(
        attendance_df["late_minutes"],
        errors="coerce"
    )

    attendance_df["working_hours"] = pd.to_numeric(
        attendance_df["working_hours"],
        errors="coerce"
    )

    attendance_df["overtime_hours"] = pd.to_numeric(
        attendance_df["overtime_hours"],
        errors="coerce"
    )

    results = []

    for date, group in attendance_df.groupby("attendance_date"):

        status = (
            group["attendance_status"]
            .astype(str)
            .str.strip()
            .str.title()
        )

        results.append({

            "attendance_date": date,

            "total_employees": int(len(group)),

            "present": int(
                (status == "Present").sum()
            ),

            "absent": int(
                (status == "Absent").sum()
            ),

            "wfh": int(
                (status == "Wfh").sum()
            ),

            "late_employees": int(
                (group["late_minutes"] > 0).sum()
            ),

            "average_working_hours": float(
                round(
                    group["working_hours"].mean(),
                    2
                )
            ),

            "total_overtime_hours": float(
                round(
                    group["overtime_hours"].sum(),
                    2
                )
            )

        })

    return {
        "total_days": len(results),
        "data": results
    }

@app.get("/reports/attendance/monthly")
def monthly_attendance_report():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "attendance_date",
        "attendance_status",
        "late_minutes",
        "working_hours",
        "overtime_hours"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Attendance columns missing.",
                "missing_columns": missing_columns
            }
        )

    attendance_df = df[required_columns].copy()

    attendance_df["attendance_date"] = pd.to_datetime(
        attendance_df["attendance_date"],
        errors="coerce"
    )

    attendance_df["month"] = attendance_df[
        "attendance_date"
    ].dt.strftime("%Y-%m")

    attendance_df["late_minutes"] = pd.to_numeric(
        attendance_df["late_minutes"],
        errors="coerce"
    )

    attendance_df["working_hours"] = pd.to_numeric(
        attendance_df["working_hours"],
        errors="coerce"
    )

    attendance_df["overtime_hours"] = pd.to_numeric(
        attendance_df["overtime_hours"],
        errors="coerce"
    )

    results = []

    for month, group in attendance_df.groupby("month"):

        status = (
            group["attendance_status"]
            .astype(str)
            .str.strip()
            .str.title()
        )

        total = len(group)

        present = int((status == "Present").sum())
        absent = int((status == "Absent").sum())
        wfh = int((status == "Wfh").sum())

        attendance_rate = round(
            ((present + wfh) / total) * 100,
            2
        ) if total else 0

        results.append({

            "month": month,

            "total_records": int(total),

            "present": present,

            "absent": absent,

            "wfh": wfh,

            "late_employees": int(
                (group["late_minutes"] > 0).sum()
            ),

            "attendance_rate": attendance_rate,

            "average_working_hours": float(
                round(
                    group["working_hours"].mean(),
                    2
                )
            ),

            "total_overtime_hours": float(
                round(
                    group["overtime_hours"].sum(),
                    2
                )
            )

        })

    return {
        "total_months": len(results),
        "data": results
    }

@app.get("/reports/overtime")
def overtime_report():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "employee_name",
        "department",
        "job_role",
        "attendance_date",
        "overtime_hours"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Overtime columns missing.",
                "missing_columns": missing_columns
            }
        )

    overtime_df = df[required_columns].copy()

    overtime_df["overtime_hours"] = pd.to_numeric(
        overtime_df["overtime_hours"],
        errors="coerce"
    ).fillna(0)

    department_summary = (
        overtime_df
        .groupby("department")["overtime_hours"]
        .sum()
        .reset_index()
        .rename(columns={
            "overtime_hours": "total_overtime_hours"
        })
        .sort_values(
            by="total_overtime_hours",
            ascending=False
        )
    )

    top_employees = (
        overtime_df
        .sort_values(
            by="overtime_hours",
            ascending=False
        )
        .head(10)
    )

    report = {

        "report_name": "Overtime Report",

        "generated_on": pd.Timestamp.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "summary": {

            "total_records": int(len(overtime_df)),

            "total_overtime_hours": float(
                round(
                    overtime_df["overtime_hours"].sum(),
                    2
                )
            ),

            "average_overtime_hours": float(
                round(
                    overtime_df["overtime_hours"].mean(),
                    2
                )
            ),

            "employees_with_overtime": int(
                (overtime_df["overtime_hours"] > 0).sum()
            )

        },

        "department_summary":
            department_summary.to_dict(
                orient="records"
            ),

        "top_overtime_employees":
            top_employees.where(
                pd.notnull(top_employees),
                None
            ).to_dict(
                orient="records"
            )

    }

    return report

@app.get("/reports/productivity")
def productivity_report():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "employee_name",
        "department",
        "job_role",
        "kpi_score",
        "goal_completion_percent",
        "productivity_score",
        "performance_rating",
        "engagement_score",
        "training_hours"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Productivity columns missing.",
                "missing_columns": missing_columns
            }
        )

    productivity_df = df[required_columns].copy()

    numeric_columns = [
        "kpi_score",
        "goal_completion_percent",
        "productivity_score",
        "performance_rating",
        "engagement_score",
        "training_hours"
    ]

    for column in numeric_columns:
        productivity_df[column] = pd.to_numeric(
            productivity_df[column],
            errors="coerce"
        )

    productivity_df["overall_score"] = (
        productivity_df["kpi_score"] +
        productivity_df["goal_completion_percent"] +
        productivity_df["productivity_score"] +
        productivity_df["engagement_score"] +
        (productivity_df["performance_rating"] * 20)
    ) / 5

    top_performers = (
        productivity_df
        .sort_values(
            by="overall_score",
            ascending=False
        )
        .head(10)
    )

    low_performers = (
        productivity_df
        .sort_values(
            by="overall_score"
        )
        .head(10)
    )

    report = {

        "report_name": "Employee Productivity Report",

        "generated_on": pd.Timestamp.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "summary": {

            "total_employees": int(len(productivity_df)),

            "average_productivity_score": float(
                round(
                    productivity_df["productivity_score"].mean(),
                    2
                )
            ),

            "average_kpi_score": float(
                round(
                    productivity_df["kpi_score"].mean(),
                    2
                )
            ),

            "average_goal_completion": float(
                round(
                    productivity_df["goal_completion_percent"].mean(),
                    2
                )
            ),

            "average_engagement_score": float(
                round(
                    productivity_df["engagement_score"].mean(),
                    2
                )
            ),

            "average_performance_rating": float(
                round(
                    productivity_df["performance_rating"].mean(),
                    2
                )
            )

        },

        "top_performers":
            top_performers.where(
                pd.notnull(top_performers),
                None
            ).to_dict(
                orient="records"
            ),

        "needs_improvement":
            low_performers.where(
                pd.notnull(low_performers),
                None
            ).to_dict(
                orient="records"
            )

    }

    return report

@app.get("/reports/shift-utilization")
def shift_utilization_report():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "employee_name",
        "department",
        "shift_type",
        "working_hours",
        "overtime_hours"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Shift columns missing.",
                "missing_columns": missing_columns
            }
        )

    shift_df = df[required_columns].copy()

    shift_df["working_hours"] = pd.to_numeric(
        shift_df["working_hours"],
        errors="coerce"
    )

    shift_df["overtime_hours"] = pd.to_numeric(
        shift_df["overtime_hours"],
        errors="coerce"
    )

    summary = (
        shift_df.groupby("shift_type")
        .agg(
            total_employees=("employee_id", "count"),
            average_working_hours=("working_hours", "mean"),
            total_overtime_hours=("overtime_hours", "sum")
        )
        .reset_index()
    )

    summary["average_working_hours"] = summary[
        "average_working_hours"
    ].round(2)

    summary["total_overtime_hours"] = summary[
        "total_overtime_hours"
    ].round(2)

    report = {

        "report_name": "Shift Utilization Report",

        "generated_on": pd.Timestamp.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "summary": {

            "total_employees": int(
                shift_df["employee_id"].nunique()
            ),

            "total_shifts": int(
                shift_df["shift_type"].nunique()
            ),

            "average_working_hours": float(
                round(
                    shift_df["working_hours"].mean(),
                    2
                )
            ),

            "total_overtime_hours": float(
                round(
                    shift_df["overtime_hours"].sum(),
                    2
                )
            )

        },

        "shift_summary":
            summary.where(
                pd.notnull(summary),
                None
            ).to_dict(orient="records")

    }

    return report

@app.get("/reports/workforce-cost")
def workforce_cost_report():

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "employee_name",
        "department",
        "basic_salary",
        "bonus",
        "deduction",
        "net_salary"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Payroll columns missing.",
                "missing_columns": missing_columns
            }
        )

    cost_df = df[required_columns].copy()

    numeric_columns = [
        "basic_salary",
        "bonus",
        "deduction",
        "net_salary"
    ]

    for column in numeric_columns:
        cost_df[column] = pd.to_numeric(
            cost_df[column],
            errors="coerce"
        ).fillna(0)

    department_cost = (
        cost_df
        .groupby("department")
        .agg(
            employees=("employee_id", "count"),
            total_basic_salary=("basic_salary", "sum"),
            total_bonus=("bonus", "sum"),
            total_deductions=("deduction", "sum"),
            total_net_salary=("net_salary", "sum"),
            average_salary=("basic_salary", "mean")
        )
        .reset_index()
    )

    department_cost["average_salary"] = (
        department_cost["average_salary"].round(2)
    )

    highest_cost_department = (
        department_cost
        .sort_values(
            by="total_net_salary",
            ascending=False
        )
        .iloc[0]["department"]
    )

    report = {

        "report_name": "Workforce Cost Analysis",

        "generated_on": pd.Timestamp.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "summary": {

            "total_employees": int(
                cost_df["employee_id"].nunique()
            ),

            "total_basic_salary": float(
                round(cost_df["basic_salary"].sum(), 2)
            ),

            "total_bonus": float(
                round(cost_df["bonus"].sum(), 2)
            ),

            "total_deductions": float(
                round(cost_df["deduction"].sum(), 2)
            ),

            "total_net_salary": float(
                round(cost_df["net_salary"].sum(), 2)
            ),

            "average_salary": float(
                round(cost_df["basic_salary"].mean(), 2)
            ),

            "highest_cost_department": highest_cost_department

        },

        "department_cost_analysis":
            department_cost.where(
                pd.notnull(department_cost),
                None
            ).to_dict(orient="records")

    }

    return report

@app.get("/reports/attrition")
def attrition_report():


    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    required_columns = [
        "employee_id",
        "employee_name",
        "department",
        "job_role",
        "attrition_status",
        "attrition_risk_score"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Attrition columns missing.",
                "missing_columns": missing_columns
            }
        )

    attrition_df = df[required_columns].copy()

    attrition_df["attrition_risk_score"] = pd.to_numeric(
        attrition_df["attrition_risk_score"],
        errors="coerce"
    ).fillna(0)

    attrition_df["attrition_status"] = (
        attrition_df["attrition_status"]
        .astype(str)
        .str.strip()
        .str.title()
    )

    # Department-wise Attrition
    department_summary = (
        attrition_df
        .groupby("department")
        .agg(
            total_employees=("employee_id", "count"),
            attrition_cases=(
                "attrition_status",
                lambda x: (x == "Yes").sum()
            )
        )
        .reset_index()
    )

    department_summary["attrition_rate"] = (
        (
            department_summary["attrition_cases"] /
            department_summary["total_employees"]
        ) * 100
    ).round(2)

    # Job Role-wise Attrition
    job_role_summary = (
        attrition_df
        .groupby("job_role")
        .agg(
            total_employees=("employee_id", "count"),
            attrition_cases=(
                "attrition_status",
                lambda x: (x == "Yes").sum()
            )
        )
        .reset_index()
    )

    job_role_summary["attrition_rate"] = (
        (
            job_role_summary["attrition_cases"] /
            job_role_summary["total_employees"]
        ) * 100
    ).round(2)

    # High Risk Employees
    high_risk = (
        attrition_df[
            attrition_df["attrition_risk_score"] >= 70
        ]
        .sort_values(
            by="attrition_risk_score",
            ascending=False
        )
    )

    report = {

        "report_name": "Attrition Report",

        "generated_on": pd.Timestamp.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "summary": {

            "total_employees": int(
                len(attrition_df)
            ),

            "employees_with_attrition": int(
                (
                    attrition_df["attrition_status"]
                    == "Yes"
                ).sum()
            ),

            "high_attrition_risk": int(
                (
                    attrition_df["attrition_risk_score"]
                    >= 70
                ).sum()
            ),

            "average_attrition_risk_score": float(
                round(
                    attrition_df[
                        "attrition_risk_score"
                    ].mean(),
                    2
                )
            )

        },

        "department_summary":
            department_summary.to_dict(
                orient="records"
            ),

        "job_role_summary":
            job_role_summary.to_dict(
                orient="records"
            ),

        "high_risk_employees":
            high_risk.where(
                pd.notnull(high_risk),
                None
            ).to_dict(
                orient="records"
            )

    }

    return report

    @app.get("/reports/department-performance")
    def department_performance_report():

        df = load_dataset()

        if df is None:
            return {"message": "No dataset uploaded yet."}

        required_columns = [
            "department",
            "employee_id",
            "kpi_score",
            "goal_completion_percent",
            "productivity_score",
            "performance_rating",
            "training_hours",
            "skill_gap_score",
            "engagement_score"
        ]

        missing_columns = [
            column
            for column in required_columns
            if column not in df.columns
        ]

        if missing_columns:
            raise HTTPException(
                status_code=500,
                detail={
                    "message": "Department performance columns missing.",
                    "missing_columns": missing_columns
                }
            )

        performance_df = df[required_columns].copy()

        numeric_columns = [
            "kpi_score",
            "goal_completion_percent",
            "productivity_score",
            "performance_rating",
            "training_hours",
            "skill_gap_score",
            "engagement_score"
        ]

        for column in numeric_columns:
            performance_df[column] = pd.to_numeric(
                performance_df[column],
                errors="coerce"
            )

        department_summary = (
            performance_df
            .groupby("department")
            .agg(
                total_employees=("employee_id", "count"),
                average_kpi_score=("kpi_score", "mean"),
                average_goal_completion=("goal_completion_percent", "mean"),
                average_productivity_score=("productivity_score", "mean"),
                average_performance_rating=("performance_rating", "mean"),
                average_training_hours=("training_hours", "mean"),
                average_skill_gap_score=("skill_gap_score", "mean"),
                average_engagement_score=("engagement_score", "mean")
            )
            .reset_index()
        )

        numeric_summary_columns = [
            "average_kpi_score",
            "average_goal_completion",
            "average_productivity_score",
            "average_performance_rating",
            "average_training_hours",
            "average_skill_gap_score",
            "average_engagement_score"
        ]

        for column in numeric_summary_columns:
            department_summary[column] = department_summary[column].round(2)

        department_summary["overall_score"] = (
            department_summary["average_kpi_score"] +
            department_summary["average_goal_completion"] +
            department_summary["average_productivity_score"] +
            department_summary["average_engagement_score"] +
            (department_summary["average_performance_rating"] * 20)
        ) / 5

        department_summary["overall_score"] = (
            department_summary["overall_score"].round(2)
        )

        department_summary = department_summary.sort_values(
            by="overall_score",
            ascending=False
        )

        report = {

            "report_name": "Department Performance Report",

            "generated_on": pd.Timestamp.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),

            "summary": {

                "total_departments": int(
                    department_summary["department"].nunique()
                ),

                "best_performing_department":
                    department_summary.iloc[0]["department"],

                "average_company_kpi": float(
                    round(
                        performance_df["kpi_score"].mean(),
                        2
                    )
                ),

                "average_company_productivity": float(
                    round(
                        performance_df["productivity_score"].mean(),
                        2
                    )
                )

            },

            "department_rankings":
                department_summary.where(
                    pd.notnull(department_summary),
                    None
                ).to_dict(orient="records")

        }

        return report



@app.get("/chatbot/health")
def chatbot_health():

    return {
        "service": "AI Workforce Chatbot",
        "status": "Online",
        "version": "1.0"
    }


@app.get("/chatbot/questions")
def chatbot_questions():

    return {

        "supported_questions": [

            "How many employees are there?",
            "What is the attendance rate?",
            "Show attendance summary",
            "Show payroll summary",
            "What is the average salary?",
            "Show department performance",
            "Show workforce summary",
            "Show productivity report",
            "Show attrition report",
            "Which department has the highest payroll cost?"

        ]

    }

@app.post("/chatbot/query")
def chatbot(request: ChatRequest):

    df = load_dataset()

    if df is None:
        return {"message": "No dataset uploaded yet."}

    question = request.question.lower().strip()

    # Total employees
    if "employee" in question and "how many" in question:

        return {
            "question": request.question,
            "answer": f"There are {len(df)} employees."
        }

    # Average salary
    elif "average salary" in question:

        average_salary = round(
            pd.to_numeric(
                df["basic_salary"],
                errors="coerce"
            ).mean(),
            2
        )

        return {
            "question": request.question,
            "answer": f"The average basic salary is ₹{average_salary}."
        }

    # Departments
    elif "department" in question:

        departments = sorted(
            df["department"].dropna().unique().tolist()
        )

        return {
            "question": request.question,
            "answer": departments
        }

    # Attendance rate
    elif "attendance rate" in question:

        attendance = (
            (
                df["attendance_status"]
                != "Absent"
            ).mean()
        ) * 100

        return {
            "question": request.question,
            "answer": f"Attendance rate is {attendance:.2f}%."
        }

    return {

        "question": request.question,

        "answer":
            "Sorry, I don't understand that question yet."

    }

