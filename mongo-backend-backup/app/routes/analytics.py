from fastapi import APIRouter, HTTPException
from app.database.s3 import read_json

router = APIRouter(
    prefix="/analytics",
    tags=["Workforce Analytics"]
)


@router.get("/kpis")
async def get_kpis():

    employees = read_json("employees.json")
    departments = read_json("department_summary.json")

    total = len(employees)

    department_distribution = []

    for dept in departments:
        department_distribution.append({
            "name": dept["department"],
            "count": dept["total_employees"],
            "color": "#3B82F6"
        })

    male = sum(1 for e in employees if e.get("gender") == "Male")
    female = sum(1 for e in employees if e.get("gender") == "Female")
    others = total - male - female

    gender_distribution = [
        {
            "name": "Male",
            "count": male,
            "percentage": round((male / total) * 100, 1)
        },
        {
            "name": "Female",
            "count": female,
            "percentage": round((female / total) * 100, 1)
        }
    ]

    if others > 0:
        gender_distribution.append({
            "name": "Other",
            "count": others,
            "percentage": round((others / total) * 100, 1)
        })

    return {

        "totalEmployees": total,

        "attritionRate": 0,

        "avgPerformance": round(
            sum(emp.get("years_at_company", 0) for emp in employees) / total,
            2
        ),

        "totalDepartments": len(departments),

        "avgSalary": 0,

        "promotionRate": 0,

        "highRiskCount": 0,

        "hiringTrend": [],

        "departmentDistribution": department_distribution,

        "genderDistribution": gender_distribution,

        "orgHealth": 94
    }
    
    
@router.get("/department-summary")
async def department_summary():
    """
    Return department analytics from S3 Gold Layer
    """

    try:
        return read_json("department_summary.json")

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/leave-summary")
async def leave_summary():
    """
    Return leave analytics from S3 Gold Layer
    """

    try:
        return read_json("leave_summary.json")

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/productivity-summary")
async def productivity_summary():
    """
    Return productivity analytics from S3 Gold Layer
    """

    try:
        return read_json("productivity_summary.json")

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/workforce-overview")
async def workforce_overview():
    """
    Return combined workforce analytics
    """

    try:

        return {
            "department_summary": read_json("department_summary.json"),
            "leave_summary": read_json("leave_summary.json"),
            "productivity_summary": read_json("productivity_summary.json")
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )