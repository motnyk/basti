import {
  AuthorizeSecurityGroupIngressCommand,
  CreateSecurityGroupCommand,
  IpPermission,
  waitUntilSecurityGroupExists,
} from '@aws-sdk/client-ec2';

import { COMMON_WAITER_CONFIG } from '../common/waiter-config.js';
import { handleWaiterError } from '../common/waiter-error.js';

import { ec2Client } from './ec2-client.js';
import {
  AwsSecurityGroup,
  SecurityGroupIngressRule,
} from './types/aws-security-group.js';

export type CreateSecurityGroupInput = Omit<AwsSecurityGroup, 'id'>;

export async function createSecurityGroup({
  name,
  description,
  vpcId,
  ingressRules,
}: CreateSecurityGroupInput): Promise<AwsSecurityGroup> {
  const { GroupId } = await ec2Client.send(
    new CreateSecurityGroupCommand({
      GroupName: name,
      Description: description,
      VpcId: vpcId,
    })
  );

  if (GroupId === undefined) {
    throw new Error(`Invalid response from AWS.`);
  }

  await handleWaiterError(
    async () =>
      await waitUntilSecurityGroupExists(
        { ...COMMON_WAITER_CONFIG, client: ec2Client.client },
        { GroupIds: [GroupId] }
      )
  );

  if (ingressRules.length > 0) {
    await ec2Client.send(
      new AuthorizeSecurityGroupIngressCommand({
        GroupId,
        IpPermissions: ingressRules.map(rule => toIpPermission(rule)),
      })
    );
  }

  return {
    id: GroupId,
    name,
    description,
    vpcId,
    ingressRules,
  };
}

function toIpPermission(rule: SecurityGroupIngressRule): IpPermission {
  const IpRanges = rule.sources
    // eslint-disable-next-line unicorn/no-array-callback-reference -- breaks type guard
    .filter(isIpRangeSource)
    .map(source => ({ CidrIp: source.cidrIp }));
  const UserIdGroupPairs = rule.sources
    // eslint-disable-next-line unicorn/no-array-callback-reference -- breaks type guard
    .filter(isSecurityGroupSource)
    .map(source => ({ GroupId: source.securityGroupId }));

  const sources = {
    IpRanges: IpRanges.length > 0 ? IpRanges : undefined,
    UserIdGroupPairs:
      UserIdGroupPairs.length > 0 ? UserIdGroupPairs : undefined,
  };

  return {
    FromPort: rule.ports?.from,
    ToPort: rule.ports?.to,

    IpProtocol: rule.ipProtocol,
    ...sources,
  };
}

function isIpRangeSource(
  source: SecurityGroupIngressRule['sources'][number]
): source is { cidrIp: string } {
  return 'cidrIp' in source;
}

function isSecurityGroupSource(
  source: SecurityGroupIngressRule['sources'][number]
): source is { securityGroupId: string } {
  return 'securityGroupId' in source;
}
