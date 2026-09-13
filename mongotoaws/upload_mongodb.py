from pymongo import MongoClient
from dotenv import load_dotenv
import os
import json

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("MONGO_DB_NAME")

client = MongoClient(mongo_uri)
db = client[db_name]

collections = {
    "employees.json": "employees",
    "leaves.json": "leaves",
    "shifts.json": "shifts",
    "timesheets.json": "timesheets",
    "notifications.json": "notifications"
}

for file_name, collection_name in collections.items():

    with open(file_name, "r") as f:
        data = json.load(f)

    collection = db[collection_name]

    collection.delete_many({})   # Remove old data

    if data:
        collection.insert_many(data)

    print(f"{collection_name}: {len(data)} documents uploaded")

print("Upload completed successfully!")