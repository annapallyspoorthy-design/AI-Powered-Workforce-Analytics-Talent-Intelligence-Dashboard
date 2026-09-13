import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient
import boto3

# Load environment variables
load_dotenv()

# MongoDB Connection
mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client["workforce_management"]

# S3 Client
s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

bucket_name = os.getenv("S3_BUCKET")

# Collections to export
collections = [
    "employees",
    "leaves",
    "shifts",
    "timesheets",
    "notifications"
]

for collection_name in collections:

    collection = db[collection_name]

    data = list(collection.find({}, {"_id": 0}))

    file_name = f"{collection_name}.json"

    with open(file_name, "w") as file:
        json.dump(data, file, indent=4, default=str)

    s3.upload_file(
        file_name,
        bucket_name,
        f"bronze/{file_name}"
    )

    print(f"{collection_name} uploaded to S3 Bronze")

print("All collections uploaded successfully!")