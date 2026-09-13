import pandas as pd

# Load dataset
df = pd.read_csv("dataset2.csv")


# -----------------------------
# Cleaning
# -----------------------------

# Remove duplicates
df = df.drop_duplicates()

# Fill missing values
df["leave_type"] = df["leave_type"].fillna("No Leave")
df["manager_alert"] = df["manager_alert"].fillna("No Alert")
df["hr_alert"] = df["hr_alert"].fillna("No Alert")


# -----------------------------
# Split into MongoDB Collections
# -----------------------------

# Employee Collection
employees = df[
    [
        "employee_id",
        "employee_name",
        "age",
        "gender",
        "department",
        "job_role",
        "education",
        "location",
        "hire_date",
        "years_at_company",
        "manager_id",
        "skill"
    ]
]


# Leave Collection
leaves = df[
    [
        "employee_id",
        "leave_type",
        "leave_days_taken",
        "leave_balance",
        "leave_approval"
    ]
]


# Shift Collection
shifts = df[
    [
        "employee_id",
        "shift_type",
        "overtime_hours",
        "shift_swap_requested"
    ]
]


# Timesheet Collection
timesheets = df[
    [
        "employee_id",
        "timesheet_hours",
        "project_hours",
        "billable_hours"
    ]
]




# Notifications Collection
notifications = df[
    [
        "employee_id",
        "manager_alert",
        "hr_alert",
        "work_anniversary",
        "birthday_month"
    ]
]


# -----------------------------
# Export JSON files
# -----------------------------

employees.to_json(
    "employees.json",
    orient="records",
    indent=4
)

leaves.to_json(
    "leaves.json",
    orient="records",
    indent=4
)

shifts.to_json(
    "shifts.json",
    orient="records",
    indent=4
)

timesheets.to_json(
    "timesheets.json",
    orient="records",
    indent=4
)

notifications.to_json(
    "notifications.json",
    orient="records",
    indent=4
)


print("MongoDB collections created successfully!")