import {
  App,
  CfnOutput,
  RemovalPolicy,
  Stack,
  StackProps
} from "@aws-cdk/core";
import { Bucket } from "@aws-cdk/aws-s3";
import {
  CfnCloudFrontOriginAccessIdentity,
  CloudFrontWebDistribution
} from "@aws-cdk/aws-cloudfront";
import { CanonicalUserPrincipal } from "@aws-cdk/aws-iam";

export class WebsiteStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucketName = "test-cdk-bucket-name";

    // Identity
    const originAccessIdentity = new CfnCloudFrontOriginAccessIdentity(
      this,
      "OriginAccessIdentity",
      {
        cloudFrontOriginAccessIdentityConfig: {
          comment: `CloudFront Identity for ${bucketName}`
        }
      }
    );

    // S3 Bucket
    const webSiteBucket = new Bucket(this, "WebSiteBucket", {
      bucketName,
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      },
      removalPolicy: RemovalPolicy.DESTROY
    });
    webSiteBucket.grantRead(
      new CanonicalUserPrincipal(originAccessIdentity.attrS3CanonicalUserId)
    );

    // CloudFront distribution
    const distribution = new CloudFrontWebDistribution(
      this,
      "WebSiteDistribution",
      {
        defaultRootObject: "index.html",
        originConfigs: [
          {
            s3OriginSource: {
              originAccessIdentityId: originAccessIdentity.ref,
              s3BucketSource: webSiteBucket
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                forwardedValues: {
                  queryString: true,
                  cookies: {
                    forward: "none"
                  }
                }
              }
            ]
          }
        ]
      }
    );
    new CfnOutput(this, "Bucket", { value: webSiteBucket.bucketName });
    new CfnOutput(this, "DistributionId", {
      value: distribution.distributionId
    });
    new CfnOutput(this, "DistributionDomainName", {
      value: distribution.domainName
    });
  }
}

const app = new App();

new WebsiteStack(app, "WebSite", { env: { region: "us-east-1" } });

app.synth();
