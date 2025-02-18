<h1 align="center">Basti</h1>

<div align="center">
  <a href="https://makeapullrequest.com/">
    <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat">
  </a>
  <a href="https://www.npmjs.com/package/basti">
    <img alt="NPM Package" src="https://img.shields.io/npm/v/basti?color=blue">
  </a>
  <a href="https://github.com/BohdanPetryshyn/basti/blob/main/LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/BohdanPetryshyn/basti">
  </a>
</div>

<br/>

<div align="center">
  <a href="https://github.com/BohdanPetryshyn/basti">Basti</a> <em>(from <a href="https://en.wikipedia.org/wiki/Bastion_host"><strong>Basti</strong>on Host</a>)</em> is a CLI tool for securely accessing your DB instances and other AWS resources in private networks almost at no cost. 
  <br/>
  <br/>
  💵 <em>No idle costs.</em>  🔑 <em>No SSH keys.</em> 🔒 <em>Fully IAM-driven.</em>
</div>

<br/>

<div align="center">
  <img alt="Demo" src="https://user-images.githubusercontent.com/45905756/211385579-3ac54ad5-7c90-4b68-9b22-239f4b26ad61.gif">
</div>

<br/>

## Why Basti?

With [Basti](https://github.com/BohdanPetryshyn/basti), you can securely connect to your RDS/Aurora/Elasticache/EC2 instances in private VPC subnets from a local machine or CI/CD pipeline almost for free!

## How it works

- 🏰 Basti sets up a so called _bastion EC2 instance_ in the connection target's VPC.

- 🧑‍💻 The bastion instance is used with AWS Session Manager port forwarding capability to make the target available on your _localhost_.

- 💵 Basti takes care of keeping the bastion instance stopped when it's not used to make the solution cost as low as **≈ 0.01 USD** per hour of connection plus **≈ 0.80 USD** per month of maintaining the instance in a stopped state.

- 🔒 Security completely relies on AWS Session Manager and IAM policies. The bastion instance is not accessible from the Internet and no SSH keys are used.

## Installation

```sh
npm install --global basti
```

Other, NodeJS-independent, installation options are coming soon!

## Basic usage

Basti uses AWS SDK and relies on credentials to be configured in your system. You can use any of [the methods](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html) supported by AWS SDK to configure credentials.

> 💡 You can expect Basti to work if you can use AWS CLI in your terminal.

### Initialize target

First, initialize your target for use with Basti. The following command will set up all the infrastructure required to start a connection. _You only need to do this once_.

```sh
basti init
```

You will be prompted for a target to initialize and a **public** VPC subnet to create the bastion EC2 instance in.

### Connect to target

Now, you can start the connection. This command will establish a secure port forwarding session and make the target available on your _localhost_.

```sh
basti connect
```

You will be prompted for the target to connect to as well as the local port to forward the connection to.

### Use target on _localhost_

Finally, you can use the target same way as it was running on your _localhost_ and port you specified in the previous step.

```sh
psql -h localhost -p 5432
```

> 💡 _psql_, the PostgreSQL client, is used as an example here. Basti can be used to connect to any type of database or other services as long as the communication is done over TCP.

### Cleanup (optional)

You can remove all the resources created by Basti in you AWS account.

```sh
basti cleanup
```

The list of resources will be displayed and you will be prompted to confirm the cleanup.

## Custom connection targets

Basti provides first class support for RDS instances and Aurora clusters. However, you can use Basti to connect to any other target in your AWS VPC (e.g. Elasticache instance, EC2 instance, etc.).

To connect to a custom target, select the `Custom` option when prompted for a target to initialize or connect to. You will be prompted for the target's VPC, IP address and port.

> 🤝 Feel free to open an issue or a pull request if you want to extend the list of natively supported targets

## Using Basti in CI/CD pipelines

Using interactive mode is convenient when you're getting used to Basti. However, in Continuous Integration and Continuous Delivery (CI/CD) pipelines, you will probably want to disable interactivity and pass all the options as command line arguments.

Take for example the non-interactive form of the `basti connect` command:

```sh
basti connect --rds-instance your-instance-id --local-port your-port
```

Use `basti <command> --help` to see all the available options for `basti connect` and other commands.

## License

Usage is provided under the MIT License. See [LICENSE](https://github.com/BohdanPetryshyn/basti/blob/main/LICENSE) for the full details.
