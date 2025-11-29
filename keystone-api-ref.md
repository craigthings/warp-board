ArraySet<V>: A set backed by an array, implements standard Set interface

Constructor: (data: ModelPropsToTransformedCreationData<{$modelId, items}>)
Properties: [fromSnapshotOverrideTypeSymbol], [modelIdPropertyNameSymbol], [propsTypeSymbol], [toSnapshotOverrideTypeSymbol], [toStringTag], $, $modelType, items
Methods: [iterator], add, clear, delete, difference, entries, forEach, getRefId, has, intersection, isDisjointFrom, isSubsetOf, isSupersetOf, keys, symmetricDifference, toString, typeCheck, union, values

ArraySetTypeInfo: Type information for ArraySet type

Constructor: (thisType: AnyStandardType, valueType: AnyStandardType)
Properties: thisType, valueType
Methods: valueTypeInfo getter

ArrayTypeInfo: Type information for array types

Constructor: (thisType: AnyStandardType, itemType: AnyStandardType)
Properties: itemType, thisType
Methods: itemTypeInfo getter

BaseDataModel<TProps>: Abstract base class for data models

Constructor: (data: ModelPropsToTransformedCreationData<TProps>)
Properties: [propsTypeSymbol], $
Methods: toString, typeCheck

BaseModel<TProps, FromSnapshotOverride, ToSnapshotOverride, ModelIdPropertyName>: Abstract base class for models

Constructor: (data: ModelPropsToTransformedCreationData<TProps>)
Properties: [fromSnapshotOverrideTypeSymbol], [modelIdPropertyNameSymbol], [propsTypeSymbol], [toSnapshotOverrideTypeSymbol], $, $modelType
Methods: $modelId getter/setter, getRefId, toString, typeCheck

BooleanTypeInfo: Type information for boolean types

Constructor: (thisType: AnyStandardType)
Properties: thisType
Methods: none

Draft<T>: Class for implementing draft functionality for data objects

Constructor: (original: T)
Properties: data, originalData
Methods: isDirty getter, commit, commitByPath, isDirtyByPath, reset, resetByPath

Frozen<T>: Class for containing immutable frozen data

Constructor: (dataToFreeze: T, checkMode?: FrozenCheckMode)
Properties: data
Methods: none

FrozenTypeInfo: Type information for frozen types

Constructor: (thisType: AnyStandardType, dataType: AnyStandardType)
Properties: dataType, thisType
Methods: dataTypeInfo getter

LiteralTypeInfo: Type information for literal types

Constructor: (thisType: AnyStandardType, literal: PrimitiveValue)
Properties: literal, thisType
Methods: none

MobxKeystoneError: Base error class for mobx-keystone

Constructor: (msg: string)
Properties: cause?, message, name, stack?, prepareStackTrace?, stackTraceLimit
Methods: captureStackTrace

ModelTypeInfo: Type information for model types

Constructor: (thisType: AnyStandardType, modelClass: ModelClass<AnyModel>)
Properties: modelClass, thisType
Methods: modelType getter, props getter

NumberTypeInfo: Type information for number types

Constructor: (thisType: AnyStandardType)
Properties: thisType
Methods: none

ObjectMap<V>: A map backed by an object-like structure, implements standard Map interface

Constructor: (data: ModelPropsToTransformedCreationData<{$modelId, items}>)
Properties: [fromSnapshotOverrideTypeSymbol], [modelIdPropertyNameSymbol], [propsTypeSymbol], [toSnapshotOverrideTypeSymbol], [toStringTag], $, $modelType, items
Methods: [iterator], clear, delete, entries, forEach, get, getRefId, has, keys, set, toString, typeCheck, values

ObjectMapTypeInfo: Type information for ObjectMap types

Constructor: (thisType: AnyStandardType, valueType: AnyStandardType)
Properties: thisType, valueType
Methods: valueTypeInfo getter

ObjectTypeInfo: Type information for object types

Constructor: (thisType: AnyStandardType, _objTypeFn: ObjectTypeFunction)
Properties: thisType
Methods: props getter

OrTypeInfo: Type information for union types

Constructor: (thisType: AnyStandardType, orTypes: readonly AnyStandardType[])
Properties: orTypes, thisType
Methods: orTypeInfos getter

RecordTypeInfo: Type information for record types

Constructor: (thisType: AnyStandardType, valueType: AnyStandardType)
Properties: valueType, thisType
Methods: valueTypeInfo getter

Ref<T>: Abstract base class for reference models

Constructor: (data: ModelPropsToTransformedCreationData<{id: string}>)
Properties: [fromSnapshotOverrideTypeSymbol], [modelIdPropertyNameSymbol], [propsTypeSymbol], [toSnapshotOverrideTypeSymbol], $, $modelType, id
Methods: current getter, isValid getter, maybeCurrent getter, forceUpdateBackRefs, getRefId, toString, typeCheck

RefTypeInfo: Type information for reference types

Constructor: (thisType: AnyStandardType)
Properties: thisType
Methods: none

RefinementTypeInfo: Type information for refinement types

Constructor: (thisType: AnyStandardType, baseType: AnyStandardType, checkFunction: Function, typeName?: string)
Properties: baseType, checkFunction, thisType, typeName
Methods: baseTypeInfo getter

SandboxManager: Manager for sandbox functionality to test changes before applying them

Constructor: (subtreeRoot: object)
Properties: none
Methods: dispose, withSandbox

StringTypeInfo: Type information for string types

Constructor: (thisType: AnyStandardType)
Properties: thisType
Methods: none

TagTypeInfo<A>: Type information for tagged types

Constructor: (thisType: AnyStandardType, baseType: AnyStandardType, tag: A, typeName?: string)
Properties: baseType, tag, thisType, typeName
Methods: baseTypeInfo getter

CopyRetryCAyesEditHere are the final classes:
TupleTypeInfo: Type information for tuple types

Constructor: (thisType: AnyStandardType, itemTypes: readonly AnyStandardType[])
Properties: itemTypes, thisType
Methods: itemTypeInfos getter

TypeCheckError: Error class for type checking failures

Constructor: (path: Path, expectedTypeName: string, actualValue: any, typeCheckedValue?: any)
Properties: actualValue, expectedTypeName, message, path, typeCheckedValue
Methods: throw

TypeInfo: Base class for type information

Constructor: (thisType: AnyStandardType)
Properties: thisType
Methods: none

UncheckedTypeInfo: Type information for unchecked types

Constructor: (thisType: AnyStandardType)
Properties: thisType
Methods: none

UndoManager: Manager for undo/redo functionality

Constructor: (disposer: ActionMiddlewareDisposer, subtreeRoot: object, store?: UndoStore, options?: UndoMiddlewareOptions)
Properties: store
Methods: canRedo/canUndo getters, clearRedo, clearUndo, createGroup, dispose, redo, undo, withGroup, withGroupFlow, withoutUndo

UndoStore: Store for undo/redo actions

Constructor: (data: ModelPropsToTransformedCreationData<{redoEvents, undoEvents}>)
Properties: [fromSnapshotOverrideTypeSymbol], [modelIdPropertyNameSymbol], [propsTypeSymbol], [toSnapshotOverrideTypeSymbol], $, $modelType, redoEvents, undoEvents
Methods: $modelId getter/setter, getRefId, toString, typeCheck

// Specifies if an action is synchronous or asynchronous
enum ActionContextActionType {
  Async = "async",
  Sync = "sync"
}

// Represents different states/steps in an async operation flow
enum ActionContextAsyncStepType {
  Resume = "resume",        // Flow continues
  ResumeError = "resumeError", // Flow encountered recoverable error
  Return = "return",        // Flow completes
  Spawn = "spawn",         // Flow starts
  Throw = "throw"          // Flow throws error to caller
}

// Indicates how an action tracking middleware completed
enum ActionTrackingResult {
  Return = "return",       // Action completed normally
  Throw = "throw"         // Action threw an error
}

// Internal built-in actions used by mobx-keystone
enum BuiltInAction {
  ApplyDelete = "$$applyDelete",
  ApplyMethodCall = "$$applyMethodCall",
  ApplyPatches = "$$applyPatches",
  ApplySet = "$$applySet",
  ApplySnapshot = "$$applySnapshot",
  Detach = "$$detach"
}

// Controls when freeze and plain JSON checks occur for frozen objects
enum FrozenCheckMode {
  DevModeOnly = "devModeOnly",
  Off = "off",
  On = "on"
}

// Internal hooks for model lifecycle events
enum HookAction {
  OnAttachedToRootStore = "$$onAttachedToRootStore",
  OnAttachedToRootStoreDisposer = "$$onAttachedToRootStoreDisposer",
  OnInit = "$$onInit",
  OnLazyInit = "$$onLazyInit"
}

// Controls when automatic type checking occurs for models
enum ModelAutoTypeCheckingMode {
  AlwaysOff = "alwaysOff",
  AlwaysOn = "alwaysOn",
  DevModeOnly = "devModeOnly"
}

// Distinguishes between single operations and grouped operations in undo history
enum UndoEventType {
  Group = "group",
  Single = "single"
}

// Determines traversal order when walking through a tree structure
enum WalkTreeMode {
  ChildrenFirst = "childrenFirst",  // Process leaves before roots
  ParentFirst = "parentFirst"       // Process roots before leaves
}
_async<A extends any[], R>(fn: (...args: A) => Generator<R>): (...args: A) => Promise<R> - Tricks TypeScript compiler into treating model flow generator as awaitable promise.
_await<T>(promise: Promise<T>): Generator<Promise<T>, T> - Makes a promise a flow that can be awaited with yield*.
abstractModelClass<T>(type: T): T & Object - Legacy helper to make TypeScript accept abstract classes as ExtendedModel parameter.
actionCallToReduxAction(actionCall: ActionCall): ReduxAction - Transforms an action call into a redux action.
actionTrackingMiddleware(subtreeRoot: object, hooks: ActionTrackingMiddleware): ActionMiddlewareDisposer - Creates simplified action tracking middleware.
addActionMiddleware(mware: ActionMiddleware): ActionMiddlewareDisposer - Adds global action middleware to run when actions are performed.
applyAction<TRet = any>(subtreeRoot: object, call: ActionCall): TRet - Applies (runs) an action over a target object.
applyDelete<O extends object, K extends string|number|symbol>(node: O, fieldName: K): void - Deletes an object field wrapped in an action.
applyMethodCall<O extends object, K extends string|number|symbol, FN>(node: O, methodName: K, ...args): ReturnType<FN> - Calls an object method wrapped in an action.
applyPatches(node: object, patches: readonly Patch[], reverse?: boolean): void - Applies patches to target object.
applySerializedActionAndSyncNewModelIds<TRet = any>(subtreeRoot: object, call: SerializedActionCallWithModelIdOverrides): TRet - Applies serialized action and syncs new model IDs on client side.
applySerializedActionAndTrackNewModelIds<TRet = any>(subtreeRoot: object, call: SerializedActionCall): {returnValue: TRet, serializedActionCall: SerializedActionCallWithModelIdOverrides} - Applies serialized action and tracks new model IDs on server side.
applySet<O extends object, K extends string|number|symbol, V>(node: O, fieldName: K, value: V): void - Sets an object field wrapped in an action.
applySnapshot<T extends object>(node: T, snapshot: SnapshotInOf<T> | SnapshotOutOf<T>): void - Applies full snapshot over an object.
arraySet<V>(values?: readonly V[]): ArraySet<V> - Creates new ArraySet model instance.
arrayToMapTransform<K,V>(): ModelPropTransform<[K,V][], Map<K,V>> - Transforms array to Map.
arrayToSetTransform<T>(): ModelPropTransform<T[], Set<T>> - Transforms array to Set.
asMap<K,V>(array: [K,V][]): ObservableMap<K,V> - Wraps array as observable map.
asReduxStore<T extends object>(target: T, ...middlewares: ReduxMiddleware<T>[]): ReduxStore<T> - Creates Redux-compatible store from mobx-keystone object.
assertIsTreeNode(value: unknown, argName?: string): void - Asserts value is tree node or throws.
asSet<T>(array: T[]): ObservableSet<T> - Wraps array as observable set.
clone<T extends object>(node: T, options?: Partial<CloneOptions>): T - Clones object by creating new snapshot with new IDs.
computedTree(...args: any[]): any - Decorator for computed properties that support tree traversal.
connectReduxDevTools(remotedevPackage: any, remotedevConnection: any, target: object, options?: {logArgsNearName?: boolean}): void - Connects tree to Redux DevTools.
createContext<T>(defaultValue?: T): Context<T> - Creates context with optional default value.
customRef<T extends object>(modelTypeId: string, options: CustomRefOptions<T>): RefConstructor<T> - Creates custom reference type.
DataModel<TProps extends ModelProps, A extends []>(modelProps: TProps): _DataModel<unknown, TProps> - Base class for data models.
decoratedModel<M,MC extends new (...args: any) => M>(name: string|undefined, clazz: MC, decorators: object): MC - Marks and decorates model class.
deepEquals(a: any, b: any): boolean - Deeply compares two values including observable objects.
deserializeActionCall(actionCall: SerializedActionCall, targetRoot?: object): ActionCall - Deserializes action call arguments.
deserializeActionCallArgument(argValue: JSONPrimitiveValue|SerializedActionCallArgument, targetRoot?: object): any - Transforms serialized action argument.
detach(node: object): void - Detaches object from tree.
draft<T extends object>(original: T): Draft<T> - Creates draft copy of tree node and children.
ExtendedDataModel<TProps extends ModelProps, TModel extends AnyDataModel>(baseModel: AbstractModelClass<TModel>, modelProps: TProps): _DataModel<TModel, TProps> - Base class for data models extending another model.
ExtendedModel<TProps extends ModelProps, TModelClass extends AbstractModelClass<AnyModel>>(baseModel: TModelClass, modelProps: TProps): _Model<InstanceType<TModelClass>, TProps> - Base class for models extending another model.
findChildren<T extends object = any>(root: object, predicate: (node: object) => boolean, options?: {deep?: boolean}): ReadonlySet<T> - Finds all children matching predicate.
findParent<T extends object = any>(child: object, predicate: (parentNode: object) => boolean, maxDepth?: number): T|undefined - Finds first matching parent.
findParentPath<T extends object = any>(child: object, predicate: (parentNode: object) => boolean, maxDepth?: number): FoundParentPath<T>|undefined - Finds first matching parent with path.
frozen<T>(data: T, checkMode?: FrozenCheckMode): Frozen<T> - Makes data immutable and not observable except root.
getChildrenObjects(node: object, options?: {deep?: boolean}): ReadonlySet<object> - Gets all non-primitive children.
getCurrentActionContext(): ActionContext|undefined - Gets currently running action context.
getDataModelMetadata(modelClassOrInstance: AnyDataModel|ModelClass<AnyDataModel>): DataModelMetadata - Returns metadata for data model.
getGlobalConfig(): Readonly<GlobalConfig> - Returns current global configuration.
getModelMetadata(modelClassOrInstance: AnyModel|ModelClass<AnyModel>): ModelMetadata - Returns metadata for model.
getModelRefId(target: object): string|undefined - Gets reference ID from model if available.
getNodeSandboxManager(node: object): SandboxManager|undefined - Returns sandbox manager for node.
getParent<T extends object = any>(value: object): T|undefined - Returns parent object or undefined.
getParentPath<T extends object = any>(value: object): ParentPath<T>|undefined - Returns parent and path to target.
getParentToChildPath(fromParent: object, toChild: object): Path|undefined - Gets path from parent to child.
getRefsResolvingTo<T extends object>(target: T, refType?: RefConstructor<T>, options?: {updateAllRefsIfNeeded?: boolean}): ObservableSet<Ref<T>> - Gets all references pointing to object.
getRoot<T extends object = any>(value: object): T - Returns root object.
getRootPath<T extends object = any>(value: object): RootPath<T> - Returns root and path to target.
getRootStore<T extends object>(node: object): T|undefined - Gets root store of tree.
getSnapshot<T>(nodeOrPrimitive: T): SnapshotOutOf<T> - Gets immutable snapshot of data structure.
getTypeInfo(type: AnyType): TypeInfo - Gets type information.
isBuiltInAction(actionName: string): boolean - Checks if action is built-in.
isChildOfParent(child: object, parent: object): boolean - Checks if target is child of parent.
isComputedTreeNode(node: object): boolean - Checks if node is computed tree node.
isDataModel(model: unknown): boolean - Checks if object is data model instance.
isGlobalUndoRecordingDisabled(): boolean - Checks if undo recording is disabled.
isHookAction(actionName: string): boolean - Checks if action is a hook.
isModel(model: unknown): boolean - Checks if object is model instance.
isModelAction(fn: AnyFunction): boolean - Checks if function is model action.
isModelDataObject(value: object): boolean - Checks if object is model data object.
isModelFlow(fn: unknown): boolean - Checks if function is model flow.
isParentOfChild(parent: object, child: object): boolean - Checks if target contains child.
isRefOfType<T extends object>(ref: Ref<object>, refType: RefConstructor<T>): boolean - Checks reference type.
isRoot(value: object): boolean - Checks if object is root.
isRootStore(node: object): boolean - Checks if object is root store.
isSandboxedNode(node: object): boolean - Checks if node is sandboxed.
isTreeNode(value: unknown): boolean - Checks if value is tree node.
jsonPatchToPatch(jsonPatch: JsonPatch): Patch - Converts JSON patch to internal patch.
jsonPointerToPath(jsonPointer: string): Path - Converts JSON pointer to path.
mapToArray<K,V>(map: Map<K,V>): [K,V][] - Converts map to array.
mapToObject<T>(map: Map<string,T>): Record<string,T> - Converts map to object.
model(name: string): ClassDecorator - Decorator marking class as model.
Model<TProps extends ModelProps>(modelProps: TProps): _Model<unknown,TProps> - Base class for models.
modelAction(...args: any[]): void - Decorator for model actions.
modelClass<T extends AnyModel|AnyDataModel>(type: {prototype: T}): ModelClass<T> - Helper for TypeScript model class typing.
modelFlow(...args: any[]): void - Decorator for model flows.
modelSnapshotInWithMetadata<M extends AnyModel>(modelClass: ModelClass<M>, snapshot: Omit<SnapshotInOfModel<M>,"$modelType">): SnapshotInOfModel<M> - Adds metadata to model creation snapshot.
modelSnapshotOutWithMetadata<M extends AnyModel>(modelClass: ModelClass<M>, snapshot: Omit<SnapshotOutOfModel<M>,"$modelType">): SnapshotOutOfModel<M> - Adds metadata to model output snapshot.
objectMap<V>(entries?: readonly [string,V][]): ObjectMap<V> - Creates new ObjectMap model instance.
objectToMapTransform<T>(): ModelPropTransform<Record<string,T>, Map<string,T>> - Transforms object to Map.
onActionMiddleware(subtreeRoot: object, listeners: {onStart?, onFinish?}): ActionMiddlewareDisposer - Attaches action listener middleware.
onChildAttachedTo(target: () => object, fn: (child: object) => void|(() => void), options?: {deep?, fireForCurrentChildren?}): (runDetachDisposers: boolean) => void - Runs callback when objects are attached.
onGlobalPatches(listener: OnGlobalPatchesListener): OnPatchesDisposer - Adds global patch listener.
onPatches(subtreeRoot: object, listener: OnPatchesListener): OnPatchesDisposer - Adds patch listener for subtree.
onSnapshot<T extends object>(nodeOrFn: T|(() => T), listener: OnSnapshotListener<T>): OnSnapshotDisposer - Adds snapshot change reaction.
patchRecorder(subtreeRoot: object, opts?: PatchRecorderOptions): PatchRecorder - Creates patch recorder.
patchToJsonPatch(patch: Patch): JsonPatch - Converts internal patch to JSON patch.
pathToJsonPointer(path: Path): string - Converts path to JSON pointer.
prop<TValue>(defaultFn: () => TValue): OptionalModelProp<TValue> - Defines model property with default function.
prop<TValue>(defaultValue: Exclude<TValue,object>): OptionalModelProp<TValue> - Defines model property with default primitive value.
prop<TValue>(): MaybeOptionalModelProp<TValue> - Defines model property with no default.
readonlyMiddleware(subtreeRoot: object): ReadonlyMiddlewareReturn - Makes subtree readonly.
registerActionCallArgumentSerializer(serializer: ActionCallArgumentSerializer<any,any>): () => void - Registers action argument serializer.
registerRootStore<T extends object>(node: T): T - Registers root store tree.
resolveId<T extends object>(root: object, id: string, getId?: RefIdResolver): T|undefined - Finds node by ID.
resolvePath<T = any>(pathRootObject: object, path: Path): {resolved: boolean, value?: T} - Resolves path from object.
rootRef<T extends object>(modelTypeId: string, options?: RootRefOptions<T>): RefConstructor<T> - Creates root reference type.
runUnprotected<T>(name: string, fn: () => T): T - Runs code block unprotected.
sandbox(subtreeRoot: object): SandboxManager - Creates sandbox manager.
serializeActionCall(actionCall: ActionCall, targetRoot?: object): SerializedActionCall - Serializes action call.
serializeActionCallArgument(argValue: any, targetRoot?: object): SerializedActionCallArgument|JSONPrimitiveValue - Serializes action argument.
setGlobalConfig(config: Partial<GlobalConfig>): void - Updates global configuration.
setToArray<T>(set: Set<T>|ObservableSet<T>): T[] - Converts set to array.
simplifyActionContext(ctx: ActionContext): SimpleActionContext - Simplifies async action context.
standaloneAction<FN extends (target: any, ...args: any[]) => any>(actionName: string, fn: FN): FN - Creates standalone action.
standaloneFlow<TTarget,TArgs extends any[],TResult>(actionName: string, fn: (target: TTarget, ...args: TArgs) => Generator<TResult>): (target: TTarget, ...args: TArgs) => Promise<TResult> - Creates standalone flow.
stringToBigIntTransform(): ModelPropTransform<string,bigint> - Transforms string to BigInt.
tag<Target extends object, TagData>(tagDataConstructor: (target: Target) => TagData): {for(target: Target): TagData} - Creates tag data accessor.
timestampToDateTransform(): ModelPropTransform<number,Date> - Transforms timestamp to Date.
toTreeNode<T extends object>(value: T): T - Makes object a tree node.
tProp(defaultValue: string|number|boolean): OptionalModelProp<string|number|boolean> - Defines primitive model property with default.
tProp<TType extends AnyType>(type: TType, defaultFn: () => TypeToData<TType>): OptionalModelProp<TypeToData<TType>> - Defines typed model property with default function.
tProp<TType extends AnyType>(type: TType, defaultValue: TypeToData<TType>): OptionalModelProp<TypeToData<TType>> - Defines typed model property with default value.
transaction(...args: any[]): void - Transaction middleware decorator.
transactionMiddleware<M extends AnyModel>(target: {actionName: keyof M, model: M}): ActionMiddlewareDisposer - Creates transaction middleware.
typeCheck<T extends AnyType>(type: T, value: TypeToData<T>): TypeCheckError|null - Validates value against type.
undoMiddleware<S>(subtreeRoot: object, store?: UndoStore, options?: UndoMiddlewareOptions<S>): UndoManager - Creates undo manager.
unregisterRootStore(node: object): void - Removes root store marking from object.
walkTree<T = void>(root: object, visit: (node: object) => undefined|T, mode: WalkTreeMode): T|undefined - Traverses tree and runs function on each node.
withoutUndo<T>(fn: () => T): T - Runs code block with undo recording disabled globally.
_DataModel <SuperModel, TProps> => Interface for defining data models with given super model and props types
_Model <SuperModel, TProps, FromSnapshotOverride, ToSnapshotOverride> => Interface for defining models with serialization overrides
ActionCall => Interface representing an action call with name, args, and target path
ActionCallArgumentSerializer <TOriginal, TSerialized> => Interface for serializing action call arguments between original and serialized forms
ActionContext => Interface for low-level action context with name, args, and execution details
ActionMiddleware => Interface for action middleware with filter and execution functions
ActionTrackingMiddleware => Interface for tracking action execution with hooks for start/finish/resume/suspend
ActionTrackingReturn => Interface for return value from action tracking with result type and value
AnyDataModel => Interface representing any kind of data model instance
AnyModel => Interface representing any kind of model instance
ArrayType <S> => Interface representing an array type with element type S
CloneOptions => Interface for configuring object cloning behavior
Context <T> => Interface for managing contextual values of type T
CustomRefOptions <T> => Interface for configuring custom references to type T
DataModelMetadata => Interface for data model metadata including data type info
FoundParentPath <T> => Interface representing path from object to found parent of type T
FromSnapshotOptions => Interface for configuring snapshot deserialization
GlobalConfig => Interface for global mobx-keystone configuration
IdentityType <Data> => Interface representing identity/primitive types
JsonPatchAddOperation <T> => Interface for JSON patch add operations with value type T
JsonPatchBaseOperation => Base interface for JSON patch operations
JsonPatchRemoveOperation => Interface for JSON patch remove operations
JsonPatchReplaceOperation <T> => Interface for JSON patch replace operations with value type T
ModelClass <M> => Interface extracting instance type from model class
ModelMetadata => Interface for model metadata including ID property and value type info
ModelOptions <TProps, FS, TS> => Interface for configuring model options including serialization
ModelProp <TPropValue, TPropCreationValue, TTransformedValue, TTransformedCreationValue, TIsRequired, TIsId, THasSetter, TFromSnapshotOverride, TToSnapshotOverride> => Interface representing a model property with full type information
ModelProps => Interface representing collection of model properties
ModelPropTransform <TOriginal, TTransformed> => Interface for transforming model property values
ModelType <Model> => Interface representing a model type
ModelTypeInfoProps => Interface for model type information including defaults and types
ObjectOfTypes => Interface representing object with type definitions
ObjectType <S> => Interface representing object type with shape S
ObjectTypeFunction => Interface for functions that return object types
ObjectTypeInfoProps => Interface for object type information
ParentPath <T> => Interface representing path from object to immediate parent of type T
PatchAddOperation <T> => Interface for patch add operations with value type T
PatchBaseOperation => Base interface for patch operations
PatchRecorder => Interface for recording model patches
PatchRecorderEvent => Interface representing a recorded patch event
PatchRecorderOptions => Interface for configuring patch recording behavior
PatchRemoveOperation => Interface for patch remove operations
PatchReplaceOperation <T> => Interface for patch replace operations with value type T
ReadonlyMiddlewareReturn => Interface for readonly middleware control functions
RecordType <S> => Interface representing record types with value type S
ReduxAction => Interface representing Redux actions for mobx-keystone
ReduxStore <T> => Interface for Redux store integration with state type T
RefConstructor <T> => Interface for constructing references to type T
RootPath <T> => Interface representing path from object to root of type T
RootRefOptions <T> => Interface for configuring root references to type T
SerializedActionCall => Interface representing serialized action calls
SerializedActionCallArgument => Interface for serialized action call arguments
SerializedActionCallWithModelIdOverrides => Interface for serialized actions with model ID changes
SimpleActionContext => Interface for simplified action context information
SnapshotInOfArraySet <V> => Interface for array set snapshot input with value type V
SnapshotInOfFrozen <F> => Interface for frozen value snapshot input
SnapshotInOfObjectMap <V> => Interface for object map snapshot input with value type V
SnapshotOutOfArraySet <V> => Interface for array set snapshot output with value type V
SnapshotOutOfFrozen <F> => Interface for frozen value snapshot output
SnapshotOutOfObjectMap <V> => Interface for object map snapshot output with value type V
Type <Name, Data> => Base interface for all types with name and data
UndoEventGroup => Interface representing group of related undo events
UndoMiddlewareOptions <S> => Interface for configuring undo middleware behavior
UndoSingleEvent => Interface representing single undo event
AbstractModelClass <M> => Type for abstract model class with instance type M
ActionMiddlewareDisposer => Type for function to remove action middleware
AnyModelProp => Type representing any kind of model property
AnyNonValueType => Type for non-value types (models, primitives, etc)
AnyStandardType => Type representing standard types (models, arrays, objects)
AnyType => Type representing any possible type
DataModelClassDeclaration <BaseModelClass, ModelInterface> => Type for data model class declarations
ExtractModelIdProp <TProps> => Type to extract ID property from model props
FromSnapshotDefaultType <TProps> => Type for default snapshot deserialization
JsonPatch => Type representing JSON patch operations
MaybeOptionalModelProp <TPropValue> => Type for potentially optional model properties
ModelClassDeclaration <BaseModelClass, ModelInterface> => Type for model class declarations
ModelCreationData <M> => Type for model creation data with transformations
ModelData <M> => Type for model data with transformations
ModelFromSnapshot <M> => Type for model snapshot deserialization
ModelIdProp <T> => Type for model ID properties
ModelIdPropertyName <M> => Type for extracting model ID property name
ModelPropFromSnapshot <MP> => Type for model property snapshot deserialization
ModelPropsOf <M> => Type to extract props from model type
ModelPropsToSetter <MP> => Type to generate setter functions from model props
ModelPropsToSnapshotCreationData <MP> => Type for snapshot creation data from model props
ModelPropsToSnapshotData <MP> => Type for snapshot data from model props
ModelPropsToTransformedCreationData <MP> => Type for transformed creation data from model props
ModelPropsToTransformedData <MP> => Type for transformed data from model props
ModelPropsToUntransformedCreationData <MP> => Type for raw creation data from model props
ModelPropsToUntransformedData <MP> => Type for raw data from model props
ModelPropToSnapshot <MP> => Type for model property snapshot serialization
ModelToSnapshot <M> => Type for model snapshot serialization
ModelUntransformedCreationData <M> => Type for raw model creation data
ModelUntransformedData <M> => Type for raw model data
OnGlobalPatchesListener => Type for global patch event listener function
OnPatchesDisposer => Type for function to remove patch listener
OnPatchesListener => Type for patch event listener function
OnSnapshotDisposer => Type for function to remove snapshot listener
OnSnapshotListener <T> => Type for snapshot change listener function
OptionalModelProp <TPropValue> => Type for optional model properties
Patch => Type representing model patch operations
Path => Type representing path from parent to child as array
PathElement => Type for single path element (string or number)
ReduxMiddleware <T> => Type for Redux middleware integration
ReduxRunner <T> => Type for Redux action processing function
RefIdResolver => Type for resolving reference IDs
RefOnResolvedValueChange <T> => Type for reference resolution change handler
RefResolver <T> => Type for resolving references
RequiredModelProps <MP> => Type to extract required properties
SnapshotInOf <T> => Type for snapshot input of any type
SnapshotInOfModel <M> => Type for model snapshot input
SnapshotInOfObject <T> => Type for object snapshot input
SnapshotOutOf <T> => Type for snapshot output of any type
SnapshotOutOfModel <M> => Type for model snapshot output
SnapshotOutOfObject <T> => Type for object snapshot output
ToSnapshotDefaultType <TProps> => Type for default snapshot serialization
TypeToData <S> => Type to extract data type from type definition
UndoEvent => Type representing undo/redo event
UndoEventWithoutAttachedState => Type for undo event without state
WithSandboxCallback <T, R> => Type for sandbox execution callback
WritablePath => Type for mutable path array
arrayActions => Object containing array manipulation actions (push, pop, splice etc) for observable arrays
cannotSerialize => Constant used to indicate a value cannot be serialized
idProp => Property creator for model IDs, returns ModelIdProp<string>
modelIdKey => Constant "$modelId" used as key for model ID property access
modelTypeKey => Constant "$modelType" used in model snapshots for type metadata
objectActions => Object containing object manipulation actions (assign, set, delete etc) for observable objects
observableOptions => Configuration object for observable behavior with deep option
reduxActionType => Constant "applyAction" used for Redux action type
types => Object containing all type definitions (array, boolean, model, etc) for model definitions and type checking