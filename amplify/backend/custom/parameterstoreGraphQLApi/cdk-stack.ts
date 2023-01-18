import * as cdk from '@aws-cdk/core';
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import * as ssm from '@aws-cdk/aws-ssm';
import * as lambda from '@aws-cdk/aws-lambda';
import { AmplifyDependentResourcesAttributes } from '../../types/amplify-dependent-resources-ref';
import { App } from '@aws-cdk/core';


export class cdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps, amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, 'env', {
      type: 'String',
      description: 'Current Amplify CLI env name',
    });
    /* AWS CDK code goes here - learn more: https://docs.aws.amazon.com/cdk/latest/guide/home.html */
    // Access other Amplify Resources 
    
    const dependencies:AmplifyDependentResourcesAttributes = AmplifyHelpers.addResourceDependency(this, 
      amplifyResourceProps.category, 
      amplifyResourceProps.resourceName, 
      [
        {category: 'api', resourceName: "communicationsmanager"},
        {category: 'auth', resourceName: "communicationsmanagerf0082716f0082716" },
        // {category: 'hosting', resourceName: "" },
      ]
    );
    const GraphQLAPIIdOutput = cdk.Fn.ref(dependencies.api.communicationsmanager.GraphQLAPIIdOutput)
    const GraphQLAPIEndpointOutput = cdk.Fn.ref(dependencies.api.communicationsmanager.GraphQLAPIEndpointOutput)
    // const BucketNameOutput = cdk.Fn.ref(dependencies.storage.s3commit2actstorage4f79922d.BucketName);
    const UserPoolIdOutput = cdk.Fn.ref(dependencies.auth.communicationsmanagerf0082716f0082716.UserPoolId);
    /* AWS CDK code goes here - learn more: https://docs.aws.amazon.com/cdk/latest/guide/home.html */
    new ssm.StringParameter(this, 'ParameterStoreGraphQLAPIId', {
      parameterName: 'GraphqlApiId',
      stringValue: GraphQLAPIIdOutput,
    });
    new ssm.StringParameter(this, 'ParameterStoreGraphQLAPIEndpoint', {
      parameterName: 'GraphQLAPIEndpoint',
      stringValue: GraphQLAPIEndpointOutput,
    });

    // new ssm.StringParameter(this, 'ParameterStoreBucketName', {
    //   parameterName: 'BucketName',
    //   stringValue: BucketNameOutput,
    // });
    new ssm.StringParameter(this, 'ParameterStoreUserPoolId', {
      parameterName: 'UserPoolId',
      stringValue: UserPoolIdOutput,
    });
  }}