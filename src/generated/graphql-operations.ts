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
  syncSource: Scalars['String']['output'];
  updateS3Source: S3Source;
};


export type MutationCreateS3SourceArgs = {
  input: CreateS3SourceInput;
};


export type MutationDeleteS3SourceArgs = {
  input: DeleteS3SourceInput;
};


export type MutationSyncSourceArgs = {
  input: SyncSourceInput;
};


export type MutationUpdateS3SourceArgs = {
  input: UpdateS3SourceInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Maybe<Scalars['String']['output']>;
  hasNextPage: Maybe<Scalars['Boolean']['output']>;
};

export type Photo = {
  __typename?: 'Photo';
  date_created: Scalars['Int']['output'];
  height: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  lat: Maybe<Scalars['Float']['output']>;
  lng: Maybe<Scalars['Float']['output']>;
  token: Scalars['String']['output'];
  width: Scalars['Int']['output'];
};

export type PhotoConnection = {
  __typename?: 'PhotoConnection';
  edges: Array<PhotoEdge>;
  errorCount: Scalars['Int']['output'];
  pageInfo: PageInfo;
};

export type PhotoEdge = {
  __typename?: 'PhotoEdge';
  cursor: Scalars['String']['output'];
  node: Photo;
};

export type PhotoError = {
  __typename?: 'PhotoError';
  error: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  objectKey: Scalars['String']['output'];
};

export type PhotoErrorConnection = {
  __typename?: 'PhotoErrorConnection';
  edges: Array<PhotoErrorEdge>;
  pageInfo: PageInfo;
};

export type PhotoErrorEdge = {
  __typename?: 'PhotoErrorEdge';
  cursor: Scalars['String']['output'];
  node: PhotoError;
};

export type Query = {
  __typename?: 'Query';
  photos: PhotoConnection;
  photosErrors: PhotoErrorConnection;
  source: Source;
  sources: Array<Source>;
  syncStatus: Maybe<SyncStatus>;
};


export type QueryPhotosArgs = {
  cursor: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPhotosErrorsArgs = {
  cursor: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySourceArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySyncStatusArgs = {
  workflowId: Scalars['ID']['input'];
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
  sync_workflow_id: Maybe<Scalars['String']['output']>;
};

export type Source = {
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  sync_workflow_id: Maybe<Scalars['String']['output']>;
};

export type SyncSourceInput = {
  id: Scalars['ID']['input'];
};

export type SyncStatus = {
  __typename?: 'SyncStatus';
  error: Maybe<Scalars['String']['output']>;
  status: SyncStatusState;
};

export type SyncStatusState =
  | 'complete'
  | 'errored'
  | 'paused'
  | 'queued'
  | 'running'
  | 'terminated'
  | 'unknown'
  | 'waiting'
  | 'waitingForPause';

export type UpdateS3SourceInput = {
  id: Scalars['ID']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  s3_api_key: InputMaybe<Scalars['String']['input']>;
  s3_api_key_secret: InputMaybe<Scalars['String']['input']>;
  s3_bucket: InputMaybe<Scalars['String']['input']>;
  s3_endpoint: InputMaybe<Scalars['String']['input']>;
  s3_region: InputMaybe<Scalars['String']['input']>;
};

export type GetPhotosQueryVariables = Exact<{
  cursor: InputMaybe<Scalars['String']['input']>;
}>;


export type GetPhotosQuery = { __typename?: 'Query', photos: { __typename?: 'PhotoConnection', edges: Array<{ __typename?: 'PhotoEdge', node: { __typename?: 'Photo', id: string, token: string, width: number, height: number } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean | null, endCursor: string | null } } };

export type CreateSourceMutationVariables = Exact<{
  input: CreateS3SourceInput;
}>;


export type CreateSourceMutation = { __typename?: 'Mutation', createS3Source: { __typename?: 'S3Source', id: string } };

export type DeleteSourceMutationVariables = Exact<{
  input: DeleteS3SourceInput;
}>;


export type DeleteSourceMutation = { __typename?: 'Mutation', deleteS3Source: { __typename?: 'S3Source', id: string } };

export type GetSourceQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSourceQuery = { __typename?: 'Query', source: { __typename?: 'S3Source', s3_endpoint: string, s3_region: string, s3_bucket: string, id: string, name: string, sync_workflow_id: string | null } };

export type GetSourcesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSourcesQuery = { __typename?: 'Query', sources: Array<{ __typename?: 'S3Source', s3_endpoint: string, s3_region: string, s3_bucket: string, id: string, name: string }> };

export type GetSyncStatusQueryVariables = Exact<{
  workflowId: Scalars['ID']['input'];
}>;


export type GetSyncStatusQuery = { __typename?: 'Query', syncStatus: { __typename?: 'SyncStatus', status: SyncStatusState, error: string | null } | null };

export type SyncSourceMutationVariables = Exact<{
  input: SyncSourceInput;
}>;


export type SyncSourceMutation = { __typename?: 'Mutation', syncSource: string };

export type UpdateSourceMutationVariables = Exact<{
  input: UpdateS3SourceInput;
}>;


export type UpdateSourceMutation = { __typename?: 'Mutation', updateS3Source: { __typename?: 'S3Source', id: string } };

export type GetSourcesIdDataQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSourcesIdDataQuery = { __typename?: 'Query', source: { __typename?: 'S3Source', id: string, name: string } };


export const GetPhotosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPhotos"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"photos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"cursor"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]} as unknown as DocumentNode<GetPhotosQuery, GetPhotosQueryVariables>;
export const CreateSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateS3SourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createS3Source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateSourceMutation, CreateSourceMutationVariables>;
export const DeleteSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteS3SourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteS3Source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteSourceMutation, DeleteSourceMutationVariables>;
export const GetSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sync_workflow_id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"S3Source"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"s3_endpoint"}},{"kind":"Field","name":{"kind":"Name","value":"s3_region"}},{"kind":"Field","name":{"kind":"Name","value":"s3_bucket"}}]}}]}}]}}]} as unknown as DocumentNode<GetSourceQuery, GetSourceQueryVariables>;
export const GetSourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"S3Source"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"s3_endpoint"}},{"kind":"Field","name":{"kind":"Name","value":"s3_region"}},{"kind":"Field","name":{"kind":"Name","value":"s3_bucket"}}]}}]}}]}}]} as unknown as DocumentNode<GetSourcesQuery, GetSourcesQueryVariables>;
export const GetSyncStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSyncStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workflowId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<GetSyncStatusQuery, GetSyncStatusQueryVariables>;
export const SyncSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SyncSourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncSource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<SyncSourceMutation, SyncSourceMutationVariables>;
export const UpdateSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateS3SourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateS3Source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateSourceMutation, UpdateSourceMutationVariables>;
export const GetSourcesIdDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSourcesIdData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetSourcesIdDataQuery, GetSourcesIdDataQueryVariables>;