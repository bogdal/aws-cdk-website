import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";

export class WebsiteStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: "test-cdk-bucket-name",
      publicReadAccess: false
    });
    new cdk.CfnOutput(this, "Bucket", { value: siteBucket.bucketName });
  }
}

const app = new cdk.App();

new WebsiteStack(app, "WebSite", { env: { region: "us-east-1" } });

app.synth();
