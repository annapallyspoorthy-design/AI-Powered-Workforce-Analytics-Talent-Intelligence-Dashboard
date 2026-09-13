from fastapi import APIRouter, HTTPException
from app.database.s3 import read_json, write_json

router = APIRouter(
    prefix="/employees",
    tags=["Employee Management"]
)


def load_employees():
    return read_json("employees.json")


# ---------------- GET ALL EMPLOYEES ----------------

@router.get("/")
async def get_all_employees(
    search: str = "",
    department: str = "All",
    sort: str = "name_asc",
    page: int = 1,
    limit: int = 1000
):

    employees = load_employees()

    # Search
    if search:
        search = search.lower()
        employees = [
            e for e in employees
            if search in e.get("employee_name", "").lower()
            or search in e.get("employee_id", "").lower()
        ]

    # Department Filter
    if department != "All":
        employees = [
            e for e in employees
            if e.get("department") == department
        ]

    # Sorting
    if sort == "name_asc":
        employees.sort(key=lambda x: x.get("employee_name", ""))

    elif sort == "name_desc":
        employees.sort(
            key=lambda x: x.get("employee_name", ""),
            reverse=True
        )

    total = len(employees)

    # Pagination
    if limit > 0:
        start = (page - 1) * limit
        end = start + limit
        employees = employees[start:end]

    return {
        "employees": employees,
        "total": total,
        "page": page,
        "totalPages": (total + limit - 1) // limit
    }


# ---------------- GET SINGLE EMPLOYEE ----------------

@router.get("/{employee_id}")
async def get_employee(employee_id: str):

    employees = load_employees()

    for employee in employees:
        if employee.get("employee_id") == employee_id:
            return employee

    raise HTTPException(
        status_code=404,
        detail="Employee not found"
    )


# ---------------- CREATE EMPLOYEE ----------------
@router.post("/")
async def create_employee(employee: dict):

    employees = load_employees()

    # Prevent duplicate IDs
    for emp in employees:
        if emp["employee_id"] == employee["employee_id"]:
            raise HTTPException(
                status_code=400,
                detail="Employee ID already exists"
            )

    employees.append(employee)

    write_json("employees.json", employees)

    return employee

# ---------------- UPDATE EMPLOYEE ----------------

@router.put("/{employee_id}")
async def update_employee(employee_id: str, employee: dict):

    employees = load_employees()

    for i, emp in enumerate(employees):

        if emp["employee_id"] == employee_id:

            employees[i].update(employee)

            write_json("employees.json", employees)

            return employees[i]

    raise HTTPException(
        status_code=404,
        detail="Employee not found"
    )


# ---------------- DELETE EMPLOYEE ----------------

@router.delete("/{employee_id}")
async def delete_employee(employee_id: str):

    employees = load_employees()

    new_employees = [
        emp
        for emp in employees
        if emp["employee_id"] != employee_id
    ]

    if len(new_employees) == len(employees):
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    write_json("employees.json", new_employees)

    return {
        "message": "Employee deleted successfully"
    }