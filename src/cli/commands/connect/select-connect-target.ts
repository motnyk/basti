import inquirer from "inquirer";
import { ConnectTarget } from "../../../target/connect-target.js";
import { createConnectTarget } from "../../../target/create-connect-target.js";
import {
  ConnectTargetInput,
  CustomConnectTargetInput,
} from "../../../target/target-input.js";
import { promptForCustomTargetVpc } from "../common/prompt-for-custom-target-vpc.js";
import { promptForAwsTarget } from "../common/prompt-for-aws-target.js";
import { selectPort } from "./select-port.js";
import {
  DehydratedAwsTargetInput,
  hydrateAwsTarget,
} from "../common/hydrate-aws-target.js";
import { handleOperation } from "../common/handle-operation.js";

const IP_REGEX = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
const DOMAIN_NAME_REGEX =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;

export type DehydratedConnectTargetInput =
  | DehydratedAwsTargetInput
  | {
      customTargetVpcId: string;
      customTargetHost: string;
      customTargetPort: number;
    };

export async function selectConnectTarget(
  dehydratedInput?: DehydratedConnectTargetInput
): Promise<ConnectTarget> {
  const targetInput = dehydratedInput
    ? await handleOperation("retrieving specified target", () =>
        hydrateInput(dehydratedInput)
      )
    : await promptForTarget();

  return createConnectTarget(targetInput);
}

async function hydrateInput(
  dehydratedInput: DehydratedConnectTargetInput
): Promise<ConnectTargetInput> {
  if ("customTargetVpcId" in dehydratedInput) {
    return {
      custom: {
        vpcId: dehydratedInput.customTargetVpcId,
        host: dehydratedInput.customTargetHost,
        port: dehydratedInput.customTargetPort,
      },
    };
  }

  return hydrateAwsTarget(dehydratedInput);
}

async function promptForTarget(): Promise<ConnectTargetInput> {
  return (await promptForAwsTarget()) || (await promptForCustomTarget());
}

async function promptForCustomTarget(): Promise<CustomConnectTargetInput> {
  const vpcId = await promptForCustomTargetVpc();

  const { host } = await inquirer.prompt({
    type: "input",
    name: "host",
    message: "Target host name / IP address",
    validate: validateHost,
  });

  const port = await selectPort("Target port number");

  return { custom: { vpcId, host, port } };
}

function validateHost(input: unknown): boolean | string {
  if (
    input == null ||
    typeof input !== "string" ||
    (!IP_REGEX.test(input) && !DOMAIN_NAME_REGEX.test(input))
  ) {
    return "Invalid host name / IP address";
  }

  return true;
}
