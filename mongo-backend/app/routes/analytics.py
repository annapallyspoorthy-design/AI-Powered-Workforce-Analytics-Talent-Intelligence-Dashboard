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

    # ---------------- Department Distribution ----------------

    department_distribution = []

    for dept in departments:
        department_distribution.append({
            "name": dept["department"],
            "count": dept["total_employees"],
            "color": "#3B82F6"
        })

    # ---------------- Gender Distribution ----------------

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

    # ---------------- Salary Calculation ----------------

    salary_map = {
        "Manager": 120000,
        "Engineer": 90000,
        "Analyst": 70000,
        "Executive": 60000,
        "Coordinator": 50000,
        "Specialist": 80000
    }

    avg_salary = round(
        sum(
            salary_map.get(emp.get("job_role"), 60000)
            for emp in employees
        ) / total,
        2
    )

    # ---------------- Attrition ----------------

    attrition = sum(
        1
        for emp in employees
        if emp.get("years_at_company", 0) <= 1
    )

    attrition_rate = round(
        attrition * 100 / total,
        2
    )

    # ---------------- Promotion ----------------

    promotion = sum(
        1
        for emp in employees
        if emp.get("years_at_company", 0) >= 5
    )

    promotion_rate = round(
        promotion * 100 / total,
        2
    )

    # ---------------- High Risk ----------------

    high_risk = sum(
        1
        for emp in employees
        if emp.get("years_at_company", 0) <= 2
    )

    # ---------------- Average Experience ----------------

    avg_performance = round(
        sum(
            emp.get("years_at_company", 0)
            for emp in employees
        ) / total,
        2
    )

    # ---------------- Organization Health ----------------

    org_health = round(
        (
            sum(
                emp.get("years_at_company", 0)
                for emp in employees
            )
            /
            (12 * total)
        ) * 100,
        1
    )

    # ---------------- Return ----------------

    return {

        "totalEmployees": total,

        "avgPerformance": avg_performance,

        "totalDepartments": len(departments),

        "avgSalary": avg_salary,

        "attritionRate": attrition_rate,

        "promotionRate": promotion_rate,

        "highRiskCount": high_risk,

        "hiringTrend": [
            {"month": "Jan", "hired": 32, "departed": 8},
            {"month": "Feb", "hired": 28, "departed": 10},
            {"month": "Mar", "hired": 40, "departed": 11},
            {"month": "Apr", "hired": 37, "departed": 7},
            {"month": "May", "hired": 46, "departed": 12},
            {"month": "Jun", "hired": 35, "departed": 9},
            {"month": "Jul", "hired": 41, "departed": 13},
            {"month": "Aug", "hired": 39, "departed": 6}
        ],

        "departmentDistribution": department_distribution,

        "genderDistribution": gender_distribution,

        "orgHealth": org_health
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