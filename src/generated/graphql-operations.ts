import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CreateS3SourceInput = {
  name: Scalars['String']['input'];
  s3_api_key: Scalars['String']['input'];
  s3_api_key_secret: Scalars['String']['input'];
  s3_bucket: Scalars['String']['input'];
  s3_endpoint: Scalars['String']['input'];
  s3_region: Scalars['String']['input'];
};

export type DeleteS3SourceInput = {
  id: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createS3Source: S3Source;
  deleteS3Source: S3Source;
  updateS3Source: S3Source;
};


export type MutationCreateS3SourceArgs = {
  input: CreateS3SourceInput;
};


export type MutationDeleteS3SourceArgs = {
  input: DeleteS3SourceInput;
};


export type MutationUpdateS3SourceArgs = {
  input: UpdateS3SourceInput;
};

export type Query = {
  __typename?: 'Query';
  photos: Array<S3Object>;
  source: Source;
  sources: Array<Source>;
};


export type QuerySourceArgs = {
  id: Scalars['ID']['input'];
};

export type S3Object = {
  __typename?: 'S3Object';
  date_created: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  lat: Maybe<Scalars['Float']['output']>;
  lng: Maybe<Scalars['Float']['output']>;
  source: S3Source;
};

export type S3Source = Source & {
  __typename?: 'S3Source';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  s3_api_key: Scalars['String']['output'];
  s3_api_key_secret: Scalars['String']['output'];
  s3_bucket: Scalars['String']['output'];
  s3_endpoint: Scalars['String']['output'];
  s3_region: Scalars['String']['output'];
};

export type Source = {
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type UpdateS3SourceInput = {
  id: Scalars['ID']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  s3_api_key: InputMaybe<Scalars['String']['input']>;
  s3_api_key_secret: InputMaybe<Scalars['String']['input']>;
  s3_bucket: InputMaybe<Scalars['String']['input']>;
  s3_endpoint: InputMaybe<Scalars['String']['input']>;
  s3_region: InputMaybe<Scalars['String']['input']>;
};

export type CreateSourceMutationVariables = Exact<{
  input: CreateS3SourceInput;
}>;


export type CreateSourceMutation = { __typename?: 'Mutation', createS3Source: { __typename?: 'S3Source', id: string } };

export type GetSourceQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSourceQuery = { __typename?: 'Query', source: { __typename?: 'S3Source', s3_endpoint: string, s3_region: string, s3_bucket: string, id: string, name: string } };

export type GetSourcesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSourcesQuery = { __typename?: 'Query', sources: Array<{ __typename?: 'S3Source', s3_endpoint: string, s3_region: string, s3_bucket: string, id: string, name: string }> };

export type UpdateSourceMutationVariables = Exact<{
  input: UpdateS3SourceInput;
}>;


export type UpdateSourceMutation = { __typename?: 'Mutation', updateS3Source: { __typename?: 'S3Source', id: string } };

export type GetSourcesIdDataQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSourcesIdDataQuery = { __typename?: 'Query', source: { __typename?: 'S3Source', id: string, name: string } };


export const CreateSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateS3SourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createS3Source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateSourceMutation, CreateSourceMutationVariables>;
export const GetSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"S3Source"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"s3_endpoint"}},{"kind":"Field","name":{"kind":"Name","value":"s3_region"}},{"kind":"Field","name":{"kind":"Name","value":"s3_bucket"}}]}}]}}]}}]} as unknown as DocumentNode<GetSourceQuery, GetSourceQueryVariables>;
export const GetSourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"S3Source"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"s3_endpoint"}},{"kind":"Field","name":{"kind":"Name","value":"s3_region"}},{"kind":"Field","name":{"kind":"Name","value":"s3_bucket"}}]}}]}}]}}]} as unknown as DocumentNode<GetSourcesQuery, GetSourcesQueryVariables>;
export const UpdateSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateS3SourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateS3Source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateSourceMutation, UpdateSourceMutationVariables>;
export const GetSourcesIdDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSourcesIdData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetSourcesIdDataQuery, GetSourcesIdDataQueryVariables>;