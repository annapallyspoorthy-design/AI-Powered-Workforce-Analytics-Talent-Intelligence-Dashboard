from fastapi import APIRouter, HTTPException
from app.database.s3 import read_json

router = APIRouter(
    prefix="/notification",
    tags=["Notifications & Alerts"]
)


@router.get("/")
async def get_all_notifications():
    """
    Return all notifications from S3 Gold Layer
    """

    try:
        return read_json("notifications.json")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/{employee_id}")
async def get_employee_notifications(employee_id: str):
    """
    Return notifications for a particular employee
    """

    try:

        notifications = read_json("notifications.json")

        employee_notifications = []

        for notification in notifications:

            if str(notification.get("employee_id")) == employee_id:
                employee_notifications.append(notification)

        if not employee_notifications:

            raise HTTPException(
                status_code=404,
                detail="Notification record not found"
            )

        return employee_notifications

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )