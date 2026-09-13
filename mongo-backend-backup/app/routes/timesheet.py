from fastapi import APIRouter, HTTPException
from app.database.s3 import read_json

router = APIRouter(
    prefix="/timesheet",
    tags=["Timesheet Management"]
)


@router.get("/")
async def get_all_timesheets():
    """
    Return all timesheet records from S3 Gold Layer
    """

    try:
        return read_json("timesheets.json")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/{employee_id}")
async def get_employee_timesheet(employee_id: str):
    """
    Return timesheet records for a particular employee
    """

    try:

        timesheets = read_json("timesheets.json")

        employee_timesheets = []

        for timesheet in timesheets:

            if str(timesheet.get("employee_id")) == employee_id:
                employee_timesheets.append(timesheet)

        if not employee_timesheets:

            raise HTTPException(
                status_code=404,
                detail="Timesheet record not found"
            )

        return employee_timesheets

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )