# AWS infrastructure

CDK stack (TypeScript) that provisions the production home for guitarserials.org:

```
┌─ Route 53 zone (pre-existing) ─────────────────────────────────────┐
│    guitarserials.org  A/AAAA  ─►  CloudFront distribution          │
│    www.guitarserials.org A/AAAA  ─►  same distribution             │
└────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─ CloudFront (us-east-1) ───────────────────────────────────────────┐
│  • ACM cert for apex + www                                         │
│  • Origin Access Control + private S3 origin                       │
│  • Security headers policy (HSTS, CSP, Referrer-Policy, …)         │
│  • CloudFront Function: rewrites /brands/gibson → /brands/gibson/  │
│    index.html so Astro folder routes resolve                       │
│  • 403/404 → /404.html                                             │
└────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─ S3 bucket (private) ──────────────────────────────────────────────┐
│  guitarserials-web-prod-guitarserials-org                          │
│  Populated by .github/workflows/deploy.yml via `aws s3 sync`       │
└────────────────────────────────────────────────────────────────────┘
```

There is **no backend**. The stack hosts the output of `apps/web` (static HTML + CSS + JS + the Decoder React island), nothing else.

## One-time bootstrap

These steps assume you already registered `guitarserials.org` and created a Route 53 public hosted zone for it.

1. **Bootstrap the target account/region (once per account):**
   ```sh
   cd infra/aws
   pnpm install
   AWS_REGION=us-east-1 pnpm exec cdk bootstrap aws://<account-id>/us-east-1
   ```
2. **Find the hosted zone id** (starts with `Z…`):
   ```sh
   aws route53 list-hosted-zones-by-name --dns-name guitarserials.org. --query 'HostedZones[0].Id'
   ```
3. **Deploy:**
   ```sh
   AWS_REGION=us-east-1 \
   HOSTED_ZONE_ID=Z01234567ABCDEFGHIJKL \
     pnpm exec cdk deploy
   ```
   The stack name is `GuitarSerialsSite`. Outputs:
   - `BucketName` — target for the `aws s3 sync` in CI
   - `DistributionId` — target for CloudFront invalidation
   - `DeployRoleArn` — ARN the GitHub Actions workflow assumes via OIDC
4. **Set GitHub repo secrets** (Settings → Secrets and variables → Actions):
   - `AWS_DEPLOY_ROLE_ARN` — the `DeployRoleArn` output
   - `AWS_S3_BUCKET` — the `BucketName` output
   - `AWS_CLOUDFRONT_DISTRIBUTION_ID` — the `DistributionId` output
5. **Push to main.** The CI deploy workflow will sync the new build and invalidate CloudFront.

## Ongoing operations

- **Preview infra changes:** `pnpm exec cdk diff`
- **Deploy infra changes:** `pnpm exec cdk deploy`
- **Tear down** (doesn't delete the S3 bucket because `RemovalPolicy.RETAIN`): `pnpm exec cdk destroy`

## Design notes

- **Why one region?** The ACM cert for CloudFront *must* live in `us-east-1`. Co-locating the rest keeps everything in one CloudFormation stack.
- **Why OAC instead of OAI?** OAC is the modern, AWS-recommended way to lock an S3 origin to a specific CloudFront distribution. It also signs requests with SigV4, which is required for bucket policies with KMS-managed encryption.
- **Why `RETAIN` on the bucket?** Accidental `cdk destroy` during experimentation shouldn't nuke production objects. Explicit delete required to clean up.
- **Why `PRICE_CLASS_100`?** Cheapest option (US/Canada/Europe edge locations). Can upgrade to `PRICE_CLASS_ALL` later without recreating the distribution.
- **Why a CloudFront Function for index rewriting?** S3 can't serve `index.html` from a nested folder when fronted by OAC (only the legacy website endpoint can, and that can't use OAC). The function rewrites `uri`s without a file extension to `<uri>/index.html`, which the bucket then serves. Functions are cheap and don't need a Lambda@Edge deployment.
- **Why scope the OIDC sub to `refs/heads/main`?** We never want a PR preview or a feature branch workflow to be able to deploy prod. Pull requests trigger the CI workflow (lint/test/build) but not deploy.

## Costs

Rough steady-state for a personal-scale reference site (order of magnitude):
- S3 storage: <1 GB → pennies
- CloudFront: 10 GB/mo egress → ~$1
- Route 53 hosted zone: $0.50/mo
- ACM cert: free
- CloudFront Functions: first 2M invocations/mo free

So: under $2/month while traffic is modest, scaling linearly with CloudFront egress.
