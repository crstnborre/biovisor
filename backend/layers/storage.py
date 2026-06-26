import boto3
from botocore.exceptions import ClientError
from decouple import config


def get_client():
    return boto3.client(
        's3',
        endpoint_url=config('AWS_S3_ENDPOINT_URL'),
        aws_access_key_id=config('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=config('AWS_SECRET_ACCESS_KEY'),
    )


def ensure_bucket():
    client = get_client()
    bucket = config('AWS_STORAGE_BUCKET_NAME')
    try:
        client.head_bucket(Bucket=bucket)
    except ClientError:
        client.create_bucket(Bucket=bucket)


def upload_file(file_obj, key):
    ensure_bucket()
    client = get_client()
    bucket = config('AWS_STORAGE_BUCKET_NAME')
    client.upload_fileobj(file_obj, bucket, key)
    return key
