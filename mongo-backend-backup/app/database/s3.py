from dotenv import load_dotenv
import boto3
import json
import os

# Load environment variables
load_dotenv()

# AWS Configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION")
S3_BUCKET = os.getenv("S3_BUCKET")

# Create S3 Client
s3 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_DEFAULT_REGION
)


def read_json(file_name):
    """
    Read a JSON file from the Gold layer of the S3 bucket.
    """

    response = s3.get_object(
        Bucket=S3_BUCKET,
        Key=f"gold/{file_name}"
    )

    return json.loads(
        response["Body"].read().decode("utf-8")
    )