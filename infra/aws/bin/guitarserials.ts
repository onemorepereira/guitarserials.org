#!/usr/bin/env tsx
import * as cdk from 'aws-cdk-lib';
import { SiteStack } from '../lib/site-stack.ts';

const app = new cdk.App();

const domain = app.node.tryGetContext('domain') ?? 'guitarserials.org';
const hostedZoneId = app.node.tryGetContext('hostedZoneId') || process.env.HOSTED_ZONE_ID;
const account = process.env.CDK_DEFAULT_ACCOUNT ?? process.env.AWS_ACCOUNT_ID;
// CloudFront + ACM for CloudFront live in us-east-1; we pin the whole stack
// there so the certificate, distribution, and DNS record co-locate cleanly.
const region = 'us-east-1';

if (!hostedZoneId) {
  throw new Error(
    'Missing hostedZoneId. Pass via `cdk deploy -c hostedZoneId=Z...` or set HOSTED_ZONE_ID.',
  );
}

new SiteStack(app, 'GuitarSerialsSite', {
  env: { account, region },
  domain,
  hostedZoneId,
  // Deterministic name makes the GitHub Actions deploy simpler — no need to
  // look it up at runtime.
  bucketName: `guitarserials-web-prod-${domain.replace(/\./g, '-')}`,
  tags: { project: 'guitarserials.org', env: 'prod' },
});
