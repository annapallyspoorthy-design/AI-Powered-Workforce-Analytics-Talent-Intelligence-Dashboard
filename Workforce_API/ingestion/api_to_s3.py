import json
from datetime import datetime

import boto3
import requests

# FastAPI endpoint
API_URL = "http://127.0.0.1:8000/data"

# S3 details
BUCKET_NAME = "nithish-datalake-2026"
PREFIX = "kalash/bronze/api/"

# Create S3 client
s3 = boto3.client("s3")


def upload_api_response():

    try:

        response = requests.get(API_URL)

        response.raise_for_status()

        data = response.json()

        # Check whether dataset exists
        if isinstance(data, dict) and data.get("message") == "No dataset uploaded yet.":
            print("Dataset not found in API.")
            return

        filename = datetime.now().strftime(
            "workforce_%Y%m%d_%H%M%S.json"
        )

        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=PREFIX + filename,
            Body=json.dumps(data, indent=4),
            ContentType="application/json"
        )

        print(f"Uploaded successfully: {filename}")

    except requests.exceptions.RequestException as e:
        print("API Error:", e)

    except Exception as e:
        print("AWS Error:", e)


if __name__ == "__main__":
    upload_api_response()