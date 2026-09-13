from fastapi import APIRouter, HTTPException
from app.database.s3 import read_json

router = APIRouter(
    prefix="/shift",
    tags=["Shift Management"]
)


@router.get("/")
async def get_all_shifts():
    """
    Return all shift records from S3 Gold Layer
    """

    try:
        return read_json("shifts.json")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/{employee_id}")
async def get_employee_shift(employee_id: str):
    """
    Return shift details for a particular employee
    """

    try:

        shifts = read_json("shifts.json")

        employee_shift = []

        for shift in shifts:

            if str(shift.get("employee_id")) == employee_id:
                employee_shift.append(shift)

        if not employee_shift:

            raise HTTPException(
                status_code=404,
                detail="Shift record not found"
            )

        return employee_shift

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )