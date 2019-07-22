## aws-cdk-website

It defines the cloud infrastructure for your static application using the AWS Cloud Development Kit (CDK).

### Configure your environment

```bash
$ export AWS_ACCESS_KEY_ID=<access_key>
$ export AWS_SECRET_ACCESS_KEY=<secret_key>
```
### Install dependencies

```bash
$ npm i
```

### Deploy the app stack

It creates the S3 bucket for files and the CloudFront distribution, which is the only one that has access to your static files.

```bash
$ npx cdk deploy -c bucketName=<my-unique-bucket-name>
```

### Destroy the app's resources

It removes all resources created in the previous step excluding the S3 bucket.

```bash
$ npx cdk destroy
```
