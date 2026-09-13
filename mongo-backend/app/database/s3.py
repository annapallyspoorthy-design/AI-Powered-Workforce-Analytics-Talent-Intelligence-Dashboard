from dotenv import load_dotenv
import boto3
import json
import os
from pathlib import Path

# Load environment variables
load_dotenv()

# AWS Configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")
S3_BUCKET = os.getenv("S3_BUCKET", "workforce-mongodb-datalake")

s3 = None
try:
    if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
        s3 = boto3.client(
            "s3",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_DEFAULT_REGION
        )
except Exception as e:
    print(f"⚠️ S3 Client initialization warning: {e}")

def get_local_json_path(file_name):
    candidate_dirs = [
        Path(__file__).resolve().parent.parent.parent.parent / "mongotoaws",
        Path(__file__).resolve().parent.parent.parent,
        Path(__file__).resolve().parent,
        Path(os.getcwd()) / "mongotoaws",
        Path(os.getcwd()),
    ]
    for d in candidate_dirs:
        p = d / file_name
        if p.exists():
            return p
    return None

def read_json(file_name):
    """
    Read a JSON file from S3 Gold layer or fallback to local JSON dataset.
    """
    if s3 and S3_BUCKET:
        try:
            response = s3.get_object(
                Bucket=S3_BUCKET,
                Key=f"gold/{file_name}"
            )
            return json.loads(response["Body"].read().decode("utf-8"))
        except Exception as e:
            print(f"⚠️ S3 read error for {file_name}: {e}. Falling back to local data.")

    local_path = get_local_json_path(file_name)
    if local_path and local_path.exists():
        with open(local_path, "r", encoding="utf-8") as f:
            return json.load(f)

    return []

def write_json(file_name, data):
    """
    Write JSON data back to S3 Gold layer or fallback to local filesystem.
    """
    written_to_s3 = False
    if s3 and S3_BUCKET:
        try:
            s3.put_object(
                Bucket=S3_BUCKET,
                Key=f"gold/{file_name}",
                Body=json.dumps(data, indent=4),
                ContentType="application/json"
            )
            written_to_s3 = True
        except Exception as e:
            print(f"⚠️ S3 write error for {file_name}: {e}")

    local_path = get_local_json_path(file_name)
    if not local_path:
        local_path = Path(__file__).resolve().parent.parent.parent.parent / "mongotoaws" / file_name

    try:
        local_path.parent.mkdir(parents=True, exist_ok=True)
        with open(local_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"⚠️ Local file write error for {file_name}: {e}")