import * as cdk from 'aws-cdk-lib';
import {
  aws_certificatemanager as acm,
  aws_cloudfront as cloudfront,
  aws_iam as iam,
  aws_cloudfront_origins as origins,
  aws_route53 as route53,
  aws_s3 as s3,
  aws_route53_targets as targets,
} from 'aws-cdk-lib';
import type { Construct } from 'constructs';

export interface SiteStackProps extends cdk.StackProps {
  /** Apex domain (e.g. guitarserials.org). A www alias is also created. */
  domain: string;
  /** Pre-existing Route 53 public hosted zone for the domain. */
  hostedZoneId: string;
  /** Deterministic S3 bucket name so the deploy workflow can reference it. */
  bucketName: string;
}

/**
 * Static-site infrastructure for guitarserials.org.
 *
 * Shape:
 *   • S3 bucket (private, versioned off, public-access blocked)
 *   • CloudFront distribution fronting the bucket via Origin Access Control
 *     (modern OAC — not the deprecated OAI)
 *   • Custom response headers policy with HSTS, Referrer-Policy, etc.
 *   • ACM cert for apex + www, DNS-validated against the hosted zone
 *   • Route 53 A/AAAA aliases for apex + www pointing at the distribution
 *
 * The bucket is filled by the GitHub Actions `deploy.yml` workflow, which
 * runs `aws s3 sync apps/web/dist/` and then invalidates the distribution.
 *
 * Must be synth/deployed in us-east-1 — CloudFront requires its ACM cert to
 * live in that region.
 */
export class SiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const { domain, hostedZoneId, bucketName } = props;
    const wwwDomain = `www.${domain}`;

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      hostedZoneId,
      zoneName: domain,
    });

    const bucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      // Astro emits index.html per route; no website endpoint needed because
      // CloudFront handles index-document resolution via a function.
    });

    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: domain,
      subjectAlternativeNames: [wwwDomain],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // Security headers. Conservative CSP — we only load fonts from Google
    // Fonts and don't ship any third-party scripts.
    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      responseHeadersPolicyName: 'guitarserials-security-headers',
      securityHeadersBehavior: {
        contentTypeOptions: { override: true },
        frameOptions: {
          frameOption: cloudfront.HeadersFrameOption.DENY,
          override: true,
        },
        referrerPolicy: {
          referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
        strictTransportSecurity: {
          accessControlMaxAge: cdk.Duration.days(365),
          includeSubdomains: true,
          preload: true,
          override: true,
        },
        xssProtection: { protection: true, modeBlock: true, override: true },
        contentSecurityPolicy: {
          contentSecurityPolicy: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            'font-src https://fonts.gstatic.com',
            "img-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
          override: true,
        },
      },
      customHeadersBehavior: {
        customHeaders: [
          { header: 'Permissions-Policy', value: 'interest-cohort=()', override: true },
          { header: 'X-Robots-Tag', value: 'all', override: false },
        ],
      },
    });

    // A CloudFront Function rewrites `/path/` to `/path/index.html` so Astro's
    // folder-based routes (e.g. /brands/gibson/) resolve to their index file
    // without hitting a bucket 403.
    const rewriteFn = new cloudfront.Function(this, 'IndexRewrite', {
      functionName: 'guitarserials-index-rewrite',
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var req = event.request;
          var uri = req.uri;
          if (uri.endsWith('/')) {
            req.uri = uri + 'index.html';
          } else if (!uri.includes('.')) {
            req.uri = uri + '/index.html';
          }
          return req;
        }
      `),
      comment: 'Resolve folder routes to index.html',
    });

    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        responseHeadersPolicy,
        functionAssociations: [
          { function: rewriteFn, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
        ],
      },
      defaultRootObject: 'index.html',
      domainNames: [domain, wwwDomain],
      certificate,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    // Apex + www A/AAAA aliases pointing at CloudFront.
    new route53.ARecord(this, 'ApexAlias', {
      zone: hostedZone,
      recordName: domain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
    new route53.AaaaRecord(this, 'ApexAliasV6', {
      zone: hostedZone,
      recordName: domain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
    new route53.ARecord(this, 'WwwAlias', {
      zone: hostedZone,
      recordName: wwwDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
    new route53.AaaaRecord(this, 'WwwAliasV6', {
      zone: hostedZone,
      recordName: wwwDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    // OIDC trust for GitHub Actions — the deploy workflow assumes this role
    // to sync the bucket and invalidate the distribution without long-lived
    // access keys.
    const oidcProvider = new iam.OpenIdConnectProvider(this, 'GithubOidc', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });
    const deployRole = new iam.Role(this, 'GithubActionsDeployRole', {
      roleName: 'guitarserials-github-deploy',
      assumedBy: new iam.FederatedPrincipal(
        oidcProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            // Restrict to this repo's main-branch workflows.
            'token.actions.githubusercontent.com:sub':
              'repo:onemorepereira/guitarserials.org:ref:refs/heads/main',
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    });
    bucket.grantReadWrite(deployRole);
    deployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['cloudfront:CreateInvalidation'],
        resources: [
          `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
        ],
      }),
    );

    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new cdk.CfnOutput(this, 'DistributionDomain', { value: distribution.distributionDomainName });
    new cdk.CfnOutput(this, 'DeployRoleArn', { value: deployRole.roleArn });
  }
}
