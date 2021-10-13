# Before You Try to Deploy

I had to give IAM SLR permissions for AppSync.

`aws iam create-role --role-name "AppSyncServiceRole" --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal": {"Service": "appsync.amazonaws.com"},"Action":"sts:AssumeRole"}]}'`

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
