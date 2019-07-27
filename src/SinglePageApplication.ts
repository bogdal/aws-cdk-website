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
import { Construct, CfnOutput, Duration, RemovalPolicy } from "@aws-cdk/core";

export interface IProps {
  bucketName: string;
  enableSSR: boolean;
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

    // Lambda@Edge functions
    const lambdaRole = new Role(this, "LambdaExecutionRole", {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal("lambda.amazonaws.com"),
        new ServicePrincipal("edgelambda.amazonaws.com")
      )
    });
    const lambdaFunctionAssociations = [
      {
        eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
        lambdaFunction: new Version(this, "OriginRequestLambdaVersion", {
          lambda: new Function(this, "OriginRequestLambda", {
            code: Code.asset(
              path.join(__dirname, "lambda-edge/origin-request")
            ),
            handler: "index.handler",
            runtime: Runtime.NODEJS_10_X,
            timeout: Duration.seconds(30),
            role: lambdaRole
          })
        })
      },
      ...(props.enableSSR
        ? [
            {
              eventType: LambdaEdgeEventType.VIEWER_REQUEST,
              lambdaFunction: new Version(this, "ViewerRequestLambdaVersion", {
                lambda: new Function(this, "ViewerRequestLambda", {
                  code: Code.asset(
                    path.join(__dirname, "lambda-edge/viewer-request")
                  ),
                  handler: "index.handler",
                  runtime: Runtime.NODEJS_10_X,
                  role: lambdaRole
                })
              })
            }
          ]
        : [])
    ];

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
                },
                ...(props.enableSSR && { headers: ["User-Agent"] })
              },
              lambdaFunctionAssociations
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
