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
The goal of this app is to show an implementation of Clean Architecture on the frontend
The benefits are essentially based on the tests

To achieve this we use the port/adapter design patterns with an interface so we can implement different adapters.
The ports define a common interface for the adapters to respect. In our app we have `http`, `in-memory` and `firestore`.
