from app.database.s3 import read_json


def department_summary():

    return read_json(
        "gold/department_summary.json"
    )


def leave_summary():

    return read_json(
        "gold/leave_summary.json"
    )


def productivity_summary():

    return read_json(
        "gold/productivity_summary.json"
    )