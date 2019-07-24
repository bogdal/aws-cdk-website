## aws-cdk-website

It defines the cloud infrastructure dedicated to static _Single Page Applications_, which uses an S3 bucket for storing the content, CloudFront for distributing the application and Lambda@Edge function for handling push-state URLs.

#### Configure your environment

```bash
$ export AWS_ACCESS_KEY_ID=<access_key>
$ export AWS_SECRET_ACCESS_KEY=<secret_key>
```

#### Install dependencies

```bash
$ npm i
```

#### Bootstrap your AWS environment

Before you can use the AWS CDK you must bootstrap your AWS environment to create the infrastructure that the AWS CDK CLI needs to deploy your Stack.

```bash
$ npx cdk bootstrap
```

#### Deploy the app stack

```bash
$ npx cdk deploy -c bucket_name=<my-unique-bucket-name>
```

#### Deploy the app content

The command output from the previous step will contain the distribution id value which you should use to deploy your application using [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html).

```bash
aws s3 sync dist s3://${BUCKET_NAME} --delete
aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"
```
