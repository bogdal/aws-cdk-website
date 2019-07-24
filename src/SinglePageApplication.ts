import * as path from "path";

import {
  LambdaEdgeEventType,
  CfnCloudFrontOriginAccessIdentity,
  CloudFrontWebDistribution
} from "@aws-cdk/aws-cloudfront";
import {
  CompositePrincipal,
  CanonicalUserPrincipal,
  Role,
  ServicePrincipal
} from "@aws-cdk/aws-iam";
import { Code, Function, Runtime, Version } from "@aws-cdk/aws-lambda";
import { Bucket } from "@aws-cdk/aws-s3";
import { Construct, CfnOutput, RemovalPolicy } from "@aws-cdk/core";

export interface IProps {
  bucketName: string;
}

export class SinglePageApplication extends Construct {
  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    const bucketName = props.bucketName;

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
    const bucket = new Bucket(this, "Bucket", {
      bucketName,
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      },
      removalPolicy: RemovalPolicy.DESTROY
    });
    bucket.grantRead(
      new CanonicalUserPrincipal(originAccessIdentity.attrS3CanonicalUserId)
    );

    // Lambda@Edge function
    const lambda = new Version(this, "LambdaVersion", {
      lambda: new Function(this, "PushStateUrlsLambda", {
        code: Code.asset(path.join(__dirname, "lambda-edge/push-state-urls")),
        handler: "index.handler",
        runtime: Runtime.NODEJS_10_X,
        role: new Role(this, "LambdaExecutionRole", {
          assumedBy: new CompositePrincipal(
            new ServicePrincipal("lambda.amazonaws.com"),
            new ServicePrincipal("edgelambda.amazonaws.com")
          )
        })
      })
    });

    // CloudFront distribution
    const distribution = new CloudFrontWebDistribution(this, "Distribution", {
      defaultRootObject: "index.html",
      originConfigs: [
        {
          s3OriginSource: {
            originAccessIdentityId: originAccessIdentity.ref,
            s3BucketSource: bucket
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              forwardedValues: {
                queryString: true,
                cookies: {
                  forward: "none"
                }
              },
              lambdaFunctionAssociations: [
                {
                  eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
                  lambdaFunction: lambda
                }
              ]
            }
          ]
        }
      ]
    });

    new CfnOutput(scope, "Bucket", { value: bucket.bucketName });
    new CfnOutput(scope, "DistributionId", {
      value: distribution.distributionId
    });
    new CfnOutput(scope, "DistributionDomainName", {
      value: distribution.domainName
    });
  }
}
