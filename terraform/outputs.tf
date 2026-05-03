output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.app_bucket.id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.app_bucket.arn
}

output "bucket_region" {
  description = "Region of the S3 bucket"
  value       = aws_s3_bucket.app_bucket.region
}

output "versioning_status" {
  description = "Versioning status of the S3 bucket"
  value       = aws_s3_bucket_versioning.app_bucket_versioning.versioning_configuration[0].status
}

output "encryption_enabled" {
  description = "Encryption status of the S3 bucket"
  value       = "Enabled (AES256)"
}

output "public_access_blocked" {
  description = "Public access block status"
  value       = "All public access blocked"
}
