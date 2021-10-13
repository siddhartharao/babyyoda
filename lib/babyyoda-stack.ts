import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';

export class BabyyodaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.createContextAppSyncStack();
  }

  private createContextAppSyncStack() : void {
    // Creates the AppSync API
    const contextApi = new appsync.GraphqlApi(this, 'Api', {
      name: 'babyyoda-context-api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))
          }
        },
      },
      xrayEnabled: true,
    });

    const contextLambda = new lambda.Function(this, 'BabyYodaContextHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'appsync-ds-main.handler',
      code: lambda.Code.fromAsset('lambda-data-sources/context'),
      memorySize: 1024
    });
    
    // Set the new Lambda function as a data source for the AppSync API
    const lambdaDs = contextApi.addLambdaDataSource('lambdaDatasource', contextLambda);
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getContextById"
    });
    
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listContexts"
    });
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createContext"
    });
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "deleteContext"
    });
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "updateContext"
    });

    const contextTable = new ddb.Table(this, 'BabyYodaContext', {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
    });
    // enable the Lambda function to access the DynamoDB table (using IAM)
    contextTable.grantFullAccess(contextLambda)
    
    // Create an environment variable that we will use in the function code
    contextLambda.addEnvironment('CONTEXT_TABLE', contextTable.tableName);

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: contextApi.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: contextApi.apiKey || ''
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region
    });
  }
}
