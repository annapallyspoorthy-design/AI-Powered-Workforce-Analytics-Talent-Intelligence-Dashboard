from fastapi import APIRouter, HTTPException
from app.database.s3 import read_json

router = APIRouter(
    prefix="/employees",
    tags=["Employee Management"]
)


@router.get("/")
async def get_all_employees():
    """
    Get all employees from S3 Gold Layer
    """
    try:
        return read_json("employees.json")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/{employee_id}")
async def get_employee(employee_id: str):
    """
    Get employee by Employee ID
    """

    try:
        employees = read_json("employees.json")

        for employee in employees:

            if str(employee.get("employee_id")) == employee_id:
                return employee

        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )