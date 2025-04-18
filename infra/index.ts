import * as pulumi from '@pulumi/pulumi'
import * as synced from '@pulumi/synced-folder'
import * as aws from '@pulumi/aws'

export default (async () => {
  const config = new pulumi.Config()

  const projectName = config.require('projectname')
  const serviceName = config.require('servicename')

  const resourcePrefix = `${projectName}-${serviceName}`

  // https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketv2/
  const bucket = new aws.s3.BucketV2(`${resourcePrefix}-bucket`, {
    bucket: `${resourcePrefix}-bucket`,
    tags: {
      name: `${resourcePrefix}`,
    },
  })

  new synced.S3BucketFolder(`${resourcePrefix}-synced-folder`, {
    path: '../dist',
    bucketName: bucket.bucket,
    acl: 'private',
  })

  new aws.s3.BucketOwnershipControls(
    `${resourcePrefix}-bucket-ownership-controls`,
    {
      bucket: bucket.bucket,
      // For options check https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html
      rule: { objectOwnership: 'BucketOwnerPreferred' },
    }
  )

  const originAccessControl = new aws.cloudfront.OriginAccessControl(
    `${resourcePrefix}-origin-access-control`,
    {
      name: `${resourcePrefix}-origin-access-control`,
      originAccessControlOriginType: 's3',
      signingBehavior: 'always',
      signingProtocol: 'sigv4',
    }
  )

  const hostedZone = config.require('hostedZone')
  const rootZone = await aws.route53.getZone({
    name: hostedZone,
  })

  const usEast1 = new aws.Provider(`${resourcePrefix}-us-east-1`, {
    region: 'us-east-1',
  })

  const subDomain = config.require('subDomain')
  const certificate = new aws.acm.Certificate(
    `${resourcePrefix}-certificate`,
    {
      domainName: subDomain,
      validationMethod: 'DNS',
    },
    { provider: usEast1 }
  )

  const CNAMERecord = new aws.route53.Record(`${resourcePrefix}-cname-record`, {
    zoneId: rootZone.zoneId,
    name: certificate.domainValidationOptions[0].resourceRecordName,
    type: certificate.domainValidationOptions[0].resourceRecordType,
    ttl: 300,
    records: [certificate.domainValidationOptions[0].resourceRecordValue],
  })

  const certificateValidation = new aws.acm.CertificateValidation(
    `${resourcePrefix}-certificate-validation`,
    {
      certificateArn: certificate.arn,
      validationRecordFqdns: [CNAMERecord.fqdn],
    },
    { provider: usEast1 }
  )

  const cloudfrontDistribution = new aws.cloudfront.Distribution(
    `${resourcePrefix}-cloudfront-distribution`,
    {
      origins: [
        {
          domainName: bucket.bucketRegionalDomainName,
          originAccessControlId: originAccessControl.id,
          originId: bucket.id,
        },
      ],
      enabled: true,
      isIpv6Enabled: true,
      defaultRootObject: 'index.html',
      defaultCacheBehavior: {
        viewerProtocolPolicy: 'redirect-to-https',
        cachedMethods: ['GET', 'HEAD'],
        allowedMethods: ['GET', 'HEAD'],
        forwardedValues: {
          cookies: { forward: 'none' },
          queryString: false,
        },
        targetOriginId: bucket.id,
        minTtl: 0,
        defaultTtl: 300,
        maxTtl: 3600,
      },
      customErrorResponses: [
        {
          errorCode: 403,
          errorCachingMinTtl: 0,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
      ],
      restrictions: {
        geoRestriction: {
          restrictionType: 'none',
          locations: [],
        },
      },
      aliases: [subDomain],
      priceClass: 'PriceClass_100',
      viewerCertificate: {
        acmCertificateArn: certificateValidation.certificateArn,
        sslSupportMethod: 'sni-only',
      },
    }
  )

  new aws.route53.Record(`${resourcePrefix}-a-record`, {
    zoneId: rootZone.zoneId,
    name: subDomain,
    type: aws.route53.RecordType.A,
    aliases: [
      {
        name: cloudfrontDistribution.domainName,
        zoneId: cloudfrontDistribution.hostedZoneId,
        evaluateTargetHealth: true,
      },
    ],
  })

  new aws.s3.BucketPolicy(`${resourcePrefix}-bucket-policy`, {
    bucket: bucket.id,
    policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowCloudFrontServicePrincipalReadOnly',
          Effect: 'Allow',
          Principal: {
            Service: 'cloudfront.amazonaws.com',
          },
          Action: ['s3:GetObject'],
          Resource: pulumi.interpolate`${bucket.arn}/*`,
          Condition: {
            StringEquals: {
              'AWS:SourceArn': pulumi.interpolate`${cloudfrontDistribution.arn}`,
            },
          },
        },
      ],
    },
  })

  return { accessUrl: subDomain }
})()
