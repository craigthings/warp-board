Mobx-Keystone examples and best practices

Copy// Basic Model Definition
@model("app/Task")
class Task extends Model({
  id: idProp,
  title: prop<string>(),
  completed: prop(false).withSetter(),
  priority: prop<"low" | "medium" | "high">("low").withSetter(),
  dueDate: prop<Date>().withTransform(timestampToDateTransform())
}) {
  @computed 
  get isOverdue() {
    return this.dueDate < new Date();
  }

  @modelAction
  toggle() {
    this.completed = !this.completed;
  }
}

// Nested Models
@model("app/Project") 
class Project extends Model({
  id: idProp,
  name: prop<string>(),
  tasks: prop<Task[]>(() => []),
  owner: prop<User | undefined>(),
  metadata: prop<Record<string, any>>(() => ({}))
}) {
  @computed
  get completedTasks() {
    return this.tasks.filter(t => t.completed);
  }

  @modelAction 
  addTask(task: Task) {
    this.tasks.push(task);
  }
}

// Root Store with Undo/Redo
@model("app/RootStore")
class RootStore extends Model({
  projects: prop<Project[]>(() => []),
  selectedProjectId: prop<string | undefined>()
}) {
  undoManager?: UndoManager;

  onInit() {
    // Setup undo manager
    this.undoManager = new UndoManager(this);
  }

  @computed
  get selectedProject() {
    return this.projects.find(p => p.id === this.selectedProjectId);
  }

  @modelAction
  addProject(project: Project) {
    this.projects.push(project);
  }
}

// Usage Example
const store = new RootStore({});
registerRootStore(store);

// Add undo middleware
undoMiddleware(store, {
  undoManager: store.undoManager!
});

// Create and modify state
const project = new Project({
  name: "My Project",
  tasks: [
    new Task({ title: "Task 1" }),
    new Task({ title: "Task 2" })
  ]
});

store.addProject(project);

// Undo/Redo
store.undoManager?.undo();
store.undoManager?.redo();

// References Example
const projectRef = rootRef<Project>("app/ProjectRef");

@model("app/TaskWithProject")
class TaskWithProject extends Model({
  task: prop<Task>(),
  projectRef: prop<Ref<Project>>()
}) {
  @computed
  get project() {
    return this.projectRef.current;
  }
}

// Drafts Example
const projectDraft = draft(project);
projectDraft.data.name = "Updated Name";
projectDraft.commit();

// Sandbox Example
const sandbox = sandbox(store);
sandbox.withSandbox([store], (sandboxStore) => {
  // Test changes
  sandboxStore.addProject(new Project({ name: "Test" }));
  return { commit: false }; // Discard changes
});

// Context Example
const themeContext = createContext<"light" | "dark">("light");

@model("app/ThemedProject")
class ThemedProject extends Model({
  name: prop<string>()
}) {
  onInit() {
    themeContext.setComputed(this, () => "dark");
  }
}

// Computed Trees
@model("app/ProjectStats") 
class ProjectStats extends Model({
  id: idProp,
  totalTasks: prop<number>(),
  completedTasks: prop<number>()
}) {}

@model("app/ProjectWithStats")
class ProjectWithStats extends Model({
  project: prop<Project>()
}) {
  @computedTree
  get stats() {
    return new ProjectStats({
      totalTasks: this.project.tasks.length,
      completedTasks: this.project.completedTasks.length
    });
  }
}
Key Points to Cover When Working with mobx-keystone:

Model definition with props and actions
Tree structure and parent-child relationships
Computed values and reactivity
Undo/redo with UndoManager
References for cross-tree relationships
Drafts for temporary edits
Sandboxes for testing changes
Contexts for dependency injection
Computed trees for derived state

typescriptCopy// Example of deeply nested collection management

@model("app/Comment")
class Comment extends Model({
  id: idProp,
  text: prop<string>(),
  author: prop<string>(),
  createdAt: prop<Date>().withTransform(timestampToDateTransform())
}) {}

@model("app/TaskWithComments")
class TaskWithComments extends Model({
  id: idProp,
  title: prop<string>(),
  comments: prop<Comment[]>(() => [])
}) {
  @modelAction
  addComment(text: string, author: string) {
    // Create and add comment in one action
    this.comments.push(new Comment({
      text,
      author,
      createdAt: new Date()
    }));
  }

  @modelAction
  removeComment(commentId: string) {
    const index = this.comments.findIndex(c => c.id === commentId);
    if (index >= 0) {
      this.comments.splice(index, 1);
    }
  }
}

@model("app/ProjectSection")
class ProjectSection extends Model({
  id: idProp,
  name: prop<string>(),
  tasks: prop<TaskWithComments[]>(() => [])
}) {
  @modelAction
  addTask(title: string) {
    this.tasks.push(new TaskWithComments({ title }));
  }

  @modelAction
  moveTask(taskId: string, toIndex: number) {
    const fromIndex = this.tasks.findIndex(t => t.id === taskId);
    if (fromIndex >= 0 && fromIndex !== toIndex) {
      const [task] = this.tasks.splice(fromIndex, 1);
      this.tasks.splice(toIndex, 0, task);
    }
  }
}

@model("app/ProjectBoard")
class ProjectBoard extends Model({
  id: idProp,
  name: prop<string>(),
  sections: prop<ProjectSection[]>(() => [])
}) {
  @modelAction
  addSection(name: string) {
    this.sections.push(new ProjectSection({ name }));
  }

  @modelAction
  moveTaskBetweenSections(
    taskId: string, 
    fromSectionId: string, 
    toSectionId: string,
    toIndex: number
  ) {
    const fromSection = this.sections.find(s => s.id === fromSectionId);
    const toSection = this.sections.find(s => s.id === toSectionId);
    
    if (!fromSection || !toSection) return;

    const taskIndex = fromSection.tasks.findIndex(t => t.id === taskId);
    if (taskIndex >= 0) {
      const [task] = fromSection.tasks.splice(taskIndex, 1);
      toSection.tasks.splice(toIndex, 0, task);
    }
  }
}
Important Rules When Working with mobx-keystone:

Tree Structure Rules:

typescriptCopy// RULE: A node can only have one parent
const task = new Task({ title: "Shared" });
section1.tasks.push(task);
section2.tasks.push(task); // ERROR: Node already has a parent

// SOLUTION: Clone the task or use references
section2.tasks.push(clone(task)); // OK
// OR
section2.taskRefs.push(taskRef(task)); // OK using references

Model Action Rules:

typescriptCopy// RULE: All modifications must be done in model actions
@model("app/Example")
class Example extends Model({
  value: prop<number>(0)
}) {
  // BAD - Direct modification
  setValue(v: number) {
    this.value = v; // Will throw error
  }

  // GOOD - Using model action
  @modelAction
  setValue(v: number) {
    this.value = v;
  }
}

Constructor Rules:

typescriptCopy// RULE: Never define your own constructor
@model("app/Example")
class Example extends Model({
  value: prop<number>(0)
}) {
  // BAD
  constructor() { } // Never do this

  // GOOD - Use onInit instead
  onInit() {
    // Initialization code here
  }
}

Default Value Rules:

typescriptCopy// RULE: Use arrow functions for non-primitive defaults
@model("app/Example")
class Example extends Model({
  // BAD - Creates shared array across instances
  items1: prop<string[]>([]),
  
  // GOOD - Creates new array for each instance
  items2: prop<string[]>(() => []),
  
  // OK - Primitive defaults don't need arrow function
  count: prop(0)
}) {}

Modification Rules:

typescriptCopy// RULE: Use standard actions for common operations
@model("app/Example")
class Example extends Model({
  items: prop<string[]>(() => [])
}) {
  @modelAction
  addItem(item: string) {
    // Use array actions for arrays
    arrayActions.push(this.items, item);
    
    // Use object actions for objects
    objectActions.set(this, "someKey", "value");
  }
}

Reference Rules:

typescriptCopy// RULE: Use references for cross-tree relationships
const taskRef = rootRef<Task>("app/TaskRef", {
  // Always handle missing references
  onResolvedValueChange(ref, newValue, oldValue) {
    if (!newValue && oldValue) {
      detach(ref);
    }
  }
});

Root Store Rules:

typescriptCopy// RULE: Register root stores for proper lifecycle hooks
const store = new RootStore({});
registerRootStore(store); // Important for lifecycle hooks

// RULE: Use onAttachedToRootStore for setup that needs root store
onAttachedToRootStore(rootStore) {
  // Setup that needs root store access
  return () => {
    // Cleanup when detached
  };
}

Computed Rules:

typescriptCopy// RULE: Don't cache values from getters
@model("app/Example")
class Example extends Model({
  items: prop<Item[]>(() => [])
}) {
  // BAD - Caching computed results
  private cachedTotal?: number;
  
  // GOOD - Let MobX handle caching
  @computed
  get total() {
    return this.items.reduce((sum, item) => sum + item.value, 0);
  }
}
These patterns and rules help maintain a clean and predictable state tree while taking advantage of mobx-keystone's features for state management.