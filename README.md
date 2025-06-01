# Deployed app
https://frontend-clean-architecture-pied.vercel.app/login


# Run the app
```shell
npm i
npm run dev
```

# Tests
## Unit tests
```shell
npm t
```

## Integration tests
```shell
npm run test:integration
```

## E2E tests
```shell
npm run test:e2e
```


# Architecture

## Overview
This app demonstrates a Clean Architecture implementation on the frontend, emphasizing testability, maintainability, and separation of concerns. The architecture follows the port/adapter pattern with dependency inversion, making it easy to swap implementations and write comprehensive tests.

## Core Principles

### 1. Port/Adapter Pattern (Hexagonal Architecture)
We use **ports** (interfaces) to define contracts and **adapters** (implementations) to fulfill them:

- **Ports**: Define what our application needs (e.g., `MessageGateway`, `TimelineGateway`, `AuthGateway`)
- **Adapters**: Provide concrete implementations (`FakeMessageGateway`, `HttpMessageGateway`, `FirebaseAuthGateway`)

### 2. Dependency Inversion
Dependencies are injected through Redux's `extraArgument` option, allowing us to easily swap implementations for testing or different environments.

### 3. Redux as Central Hub
Redux serves as our application's central nervous system, coordinating between:
- **Use cases** (thunks) - Application business logic
- **ViewModels** (selectors) - Presentation logic
- **Gateways** (adapters) - External system interactions

## Architecture Layers

```
+-------------------------------------------------------------+
|                    PRESENTATION LAYER                       |
|              Components, ViewModels, UI Logic               |
|                                                             |
|    +-----------------+          +-----------------+         |
|    |   Components    |  <---->  |   ViewModels    |         |
|    |    (React)      |          |   (Selectors)   |         |
|    +-----------------+          +-----------------+         |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                    APPLICATION LAYER                        |
|           Use Cases, Business Logic, State Management       |
|                                                             |
|    +-----------------+          +-----------------+         |
|    |   Use Cases     |  <---->  |   Redux Store   |         |
|    |   (Thunks)      |          |     (State)     |         |
|    +-----------------+          +-----------------+         |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                  INFRASTRUCTURE LAYER                       |
|            External Systems, APIs, Storage                  |
|                                                             |
|    +-----------------+          +-----------------+         |
|    |    Gateways     |  <---->  |    Adapters     |         |
|    |  (Interfaces)   |          | (HTTP, Firebase)|         |
|    +-----------------+          +-----------------+         |
+-------------------------------------------------------------+
```

## Practical Example: Posting a Message

Let's trace through how posting a message works in our architecture:

### 1. Gateway (Port/Adapter Pattern)

**Interface (Port):**
```typescript
// src/lib/timelines/model/message.gateway.ts
export interface MessageGateway {
  postMessage(message: {
    id: string;
    author: string;
    text: string;
    publishedAt: string;
    timelineId: string;
  }): Promise<void>;
}
```

**Implementations (Adapters):**
```typescript
// Production - HTTP adapter
export class HttpMessageGateway implements MessageGateway {
  async postMessage(message: { /* ... */ }): Promise<void> {
    await axios.post("http://localhost:3000/messages", message);
  }
}

// Testing - Fake adapter
export class FakeMessageGateway implements MessageGateway {
  lastPostedMessage!: any;

  async postMessage(message: { /* ... */ }): Promise<void> {
    this.lastPostedMessage = message;
    return Promise.resolve();
  }
}

// Development - Failing adapter for error scenarios
export class FailingMessageGateway implements MessageGateway {
  async postMessage(): Promise<void> {
    return Promise.reject("Network error");
  }
}
```

### 2. Use Case (Business Logic)

```typescript
// src/lib/timelines/usecases/post-message.usecase.ts
export const postMessage = createAppAsyncThunk(
  "timelines/postMessage",
  (
    params: PostMessageParams,
    { extra: { dateProvider, messageGateway }, dispatch, getState }
  ) => {
    // 1. Get current user from state
    const authUser = selectAuthUserId(getState());

    // 2. Create domain entity
    const message: Message = {
      id: params.messageId,
      text: params.text,
      author: authUser,
      publishedAt: dateProvider.getNow().toISOString(),
      likes: [],
    };

    // 3. Optimistic update
    dispatch(postMessagePending(message));

    // 4. Call external system through gateway
    return messageGateway.postMessage({
      id: message.id,
      text: message.text,
      author: message.author,
      publishedAt: message.publishedAt,
      timelineId: params.timelineId,
    });
  }
);
```

### 3. ViewModel (Presentation Logic)

```typescript
// src/components/AddPostForm/add-post-form.viewmodel.ts
export const createAddPostFormViewModel = ({ charactersCount }: { charactersCount: number }) =>
  createSelector([selectAuthUser], (authUser) => {
    const hasReachedMaxCount = charactersCount > MAX_CHARACTERS;
    const canSubmit = charactersCount !== 0 && !hasReachedMaxCount;

    return {
      canSubmit,
      inputBackroundColor: hasReachedMaxCount ? "red.300" : "white",
      charCounterColor: hasReachedMaxCount ? "red.300" : "muted",
      remaining: MAX_CHARACTERS - charactersCount,
      authUser: {
        profilePicture: authUser?.profilePicture ?? "",
        profileUrl: `/u/${authUser?.id}`,
      },
    };
  });
```

### 4. Component (UI)

```typescript
// src/components/AddPostForm/AddPostForm.tsx
export const AddPostForm = ({ placeholder, timelineId }) => {
  const [charactersCount, setCharactersCount] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const { canSubmit, authUser } = useSelector(createAddPostFormViewModel({ charactersCount }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = event.currentTarget.elements.text.value;

    // Dispatch use case
    await dispatch(postMessage({
      messageId: nanoid(5),
      text,
      timelineId,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* UI components */}
    </form>
  );
};
```

## Dependency Injection Setup

```typescript
// src/lib/create-store.ts
export type Dependencies = {
  authGateway: AuthGateway;
  timelineGateway: TimelineGateway;
  messageGateway: MessageGateway;
  userGateway: UserGateway;
  notificationGateway: NotificationGateway;
  dateProvider: DateProvider;
};

export const createStore = (dependencies: Dependencies) => {
  return configureStore({
    reducer: rootReducer,
    middleware(getDefaultMiddleware) {
      return getDefaultMiddleware({
        thunk: {
          extraArgument: dependencies, // 🔑 Dependency injection
        },
      });
    },
  });
};
```

## Testing Strategy

### 1. Use Case Tests (Business Logic)

```typescript
// src/lib/timelines/__tests__/post-message.usecase.spec.ts
describe("Feature: Posting a message on a timeline", () => {
  test("Alice can post a message on her empty timeline", async () => {
    // Given
    const alice = buildUser({ id: "alice-id", username: "Alice" });
    authFixture.givenAuthenticatedUserIs("alice-id");
    fixture.givenTimeline({ id: "alice-timeline-id", user: alice, messages: [] });

    // When
    await fixture.whenUserPostsMessage({
      messageId: "msg1-id",
      timelineId: "alice-timeline-id",
      text: "Hello it's Alice",
    });

    // Then
    fixture.thenMessageShouldHaveBeenPosted({
      id: "msg1-id",
      author: "alice-id",
      text: "Hello it's Alice",
    });
  });
});
```

### 2. ViewModel Tests (Presentation Logic)

```typescript
// src/components/AddPostForm/__tests__/add-post-form.viewmodel.test.ts
describe("AddPostForm ViewModel", () => {
  test("can submit when text is valid", () => {
    const state = stateBuilder().withAuthUser({ authUser: alice }).build();

    const viewModel = createAddPostFormViewModel({ charactersCount: 50 })(state);

    expect(viewModel.canSubmit).toBe(true);
    expect(viewModel.inputBackroundColor).toBe("white");
  });
});
```

### 3. Integration Tests (Gateway)

```typescript
// src/lib/timelines/infra/__tests__/http-message.gateway.integration.test.ts
describe("HttpMessageGateway", () => {
  test("postMessage sends correct data", async () => {
    const message = { id: "m1", author: "alice-id", text: "Hello" };

    server.use(
      http.post("http://localhost:3000/messages", () => HttpResponse.json(message))
    );

    await messageGateway.postMessage(message);
    // Verify HTTP call was made correctly
  });
});
```

### 4. E2E Tests (Full Flow)

```typescript
// src/__e2e__/post-message.e2e.test.tsx
describe("Post Message E2E", () => {
  test("user can post a message and see it in timeline", async () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("What's on your mind?"), {
      target: { value: "Hello World" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Post" }));

    expect(await screen.findByText("Hello World")).toBeInTheDocument();
  });
});
```

## Why This Architecture Is Efficient and Testable

### 1. **Separation of Concerns**
- **ViewModels** handle presentation logic (formatting, validation)
- **Use Cases** handle business logic (domain rules, workflows)
- **Gateways** handle external system communication

### 2. **Dependency Inversion**
- High-level modules don't depend on low-level modules
- Easy to swap implementations (fake ↔ real)
- Enables isolated unit testing

### 3. **Testability Benefits**
- **Fast Tests**: Use fake adapters, no network calls
- **Reliable Tests**: Deterministic behavior with controlled dependencies
- **Focused Tests**: Test one layer at a time
- **Easy Mocking**: Interfaces make mocking straightforward

### 4. **Maintainability**
- **Single Responsibility**: Each component has one reason to change
- **Open/Closed**: Easy to add new features without modifying existing code
- **Interface Segregation**: Small, focused interfaces
- **DRY**: Shared logic in use cases, not scattered in components

### 5. **Development Workflow**
- **TDD Friendly**: Write tests first with fake adapters
- **Parallel Development**: Frontend and backend teams can work independently
- **Environment Flexibility**: Same code works with different backends
- **Error Handling**: Centralized error handling in use cases

This architecture makes the codebase more maintainable, testable, and allows teams to work independently while ensuring consistent business logic across the application.
