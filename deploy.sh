cd ./deployment

VERSION=2020-08-30

./build-s3-dist.sh serverless-image-handler-nutmeg serverless-image-handler $VERSION

aws s3 cp ./regional-s3-assets/ s3://serverless-image-handler-nutmeg-us-west-1/serverless-image-handler/$VERSION/ --recursive --acl bucket-owner-full-control

# After the template and code are uploaded, the Cloudformation stack can be updated in the AWS console (us-west-1)
