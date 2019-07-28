## aws-cdk-website

It defines the cloud infrastructure dedicated to static _Single Page Applications_, which uses an S3 bucket for storing the content, CloudFront for distributing the application and Lambda@Edge functions for handling push-state URLs and server-side rendering.

### SSR

This Stack provides server-side rendering using [https://render-tron.appspot.com/](https://render-tron.appspot.com/) service by default, but it should also be compatible with other services, such as [prerender.io](https://prerender.io/). If you have your own [Rendertron](https://github.com/GoogleChrome/rendertron) instance, just set the URL inside the `cdk.json` file.

## Let's start

#### Set AWS credentials

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

#### Configure your infastructure

Modify the `cdk.json` file and adjust the _context_ values to your needs:

```
  ...
  "context": {
    "bucket_name": "<your-bucket-name>",
    "enable_ssr": true,
    "ssr_service_url": "https://render-tron.appspot.com/render/"
  }
```

#### Deploy the app stack

```bash
$ npm run deploy
```

#### Deploy the app content

The command output from the previous step will contain the distribution id value which you should use to deploy your application using [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html).

```bash
aws s3 sync dist s3://${BUCKET_NAME} --delete
aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"
```
