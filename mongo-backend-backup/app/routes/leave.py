from fastapi import APIRouter, HTTPException
from app.database.s3 import read_json

router = APIRouter(
    prefix="/leave",
    tags=["Leave Management"]
)


@router.get("/")
async def get_all_leaves():
    """
    Return all leave records from S3 Gold Layer
    """

    try:
        return read_json("leaves.json")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/{employee_id}")
async def get_employee_leave(employee_id: str):
    """
    Return leave details for a particular employee
    """

    try:

        leaves = read_json("leaves.json")

        employee_leave = []

        for leave in leaves:

            if str(leave.get("employee_id")) == employee_id:

                employee_leave.append(leave)

        if not employee_leave:

            raise HTTPException(
                status_code=404,
                detail="Leave record not found"
            )

        return employee_leave

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )