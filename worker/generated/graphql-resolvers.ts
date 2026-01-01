import { GraphQLResolveInfo } from 'graphql';
import { ObjectRowResolver, SourceRowResolver } from '../db-types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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

export type Photo = S3Object;

export type Query = {
  __typename?: 'Query';
  photos: Array<Photo>;
  source: Maybe<Source>;
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

export type S3Source = {
  __typename?: 'S3Source';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  s3_api_key: Scalars['String']['output'];
  s3_api_key_secret: Scalars['String']['output'];
  s3_bucket: Scalars['String']['output'];
  s3_endpoint: Scalars['String']['output'];
  s3_region: Scalars['String']['output'];
};

export type Source = S3Source;

export type UpdateS3SourceInput = {
  id: Scalars['ID']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  s3_api_key: InputMaybe<Scalars['String']['input']>;
  s3_api_key_secret: InputMaybe<Scalars['String']['input']>;
  s3_bucket: InputMaybe<Scalars['String']['input']>;
  s3_endpoint: InputMaybe<Scalars['String']['input']>;
  s3_region: InputMaybe<Scalars['String']['input']>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  Photo: ( ObjectRowResolver );
  Source: ( SourceRowResolver );
}>;


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreateS3SourceInput: CreateS3SourceInput;
  DeleteS3SourceInput: DeleteS3SourceInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Photo: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['Photo']>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  S3Object: ResolverTypeWrapper<ObjectRowResolver>;
  S3Source: ResolverTypeWrapper<SourceRowResolver>;
  Source: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['Source']>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateS3SourceInput: UpdateS3SourceInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  CreateS3SourceInput: CreateS3SourceInput;
  DeleteS3SourceInput: DeleteS3SourceInput;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: Record<PropertyKey, never>;
  Photo: ResolversUnionTypes<ResolversParentTypes>['Photo'];
  Query: Record<PropertyKey, never>;
  S3Object: ObjectRowResolver;
  S3Source: SourceRowResolver;
  Source: ResolversUnionTypes<ResolversParentTypes>['Source'];
  String: Scalars['String']['output'];
  UpdateS3SourceInput: UpdateS3SourceInput;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  createS3Source: Resolver<ResolversTypes['S3Source'], ParentType, ContextType, RequireFields<MutationCreateS3SourceArgs, 'input'>>;
  deleteS3Source: Resolver<ResolversTypes['S3Source'], ParentType, ContextType, RequireFields<MutationDeleteS3SourceArgs, 'input'>>;
  updateS3Source: Resolver<ResolversTypes['S3Source'], ParentType, ContextType, RequireFields<MutationUpdateS3SourceArgs, 'input'>>;
}>;

export type PhotoResolvers<ContextType = any, ParentType extends ResolversParentTypes['Photo'] = ResolversParentTypes['Photo']> = ResolversObject<{
  __resolveType: TypeResolveFn<'S3Object', ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  photos: Resolver<Array<ResolversTypes['Photo']>, ParentType, ContextType>;
  source: Resolver<Maybe<ResolversTypes['Source']>, ParentType, ContextType, RequireFields<QuerySourceArgs, 'id'>>;
  sources: Resolver<Array<ResolversTypes['Source']>, ParentType, ContextType>;
}>;

export type S3ObjectResolvers<ContextType = any, ParentType extends ResolversParentTypes['S3Object'] = ResolversParentTypes['S3Object']> = ResolversObject<{
  date_created?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  source?: Resolver<ResolversTypes['S3Source'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type S3SourceResolvers<ContextType = any, ParentType extends ResolversParentTypes['S3Source'] = ResolversParentTypes['S3Source']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  s3_api_key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  s3_api_key_secret?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  s3_bucket?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  s3_endpoint?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  s3_region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SourceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Source'] = ResolversParentTypes['Source']> = ResolversObject<{
  __resolveType: TypeResolveFn<'S3Source', ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Mutation?: MutationResolvers<ContextType>;
  Photo?: PhotoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  S3Object?: S3ObjectResolvers<ContextType>;
  S3Source?: S3SourceResolvers<ContextType>;
  Source?: SourceResolvers<ContextType>;
}>;

