# Refined DevOps Documentation

## 1. Architecture Overview
This application follows a modern **Monolithic-Managed Service Architecture**:
-   **Frontend**: Built with **Next.js (App Router)** for dynamic server-side rendering and high performance.
-   **Backend**: A **Node.js / Express** REST API that handles auth, product catalog, and order management.
-   **Database**: **MongoDB (Mongoose ODM)** for high scalability and flexible schema management.
-   **Infrastructure**: Designed to run on **AWS EC2** with automated deployment workflows.

## 2. CI/CD Workflow
We've implemented a robust automated pipeline:
-   **CI (Continuous Integration)**: Triggered on every Push and Pull Request (`ci.yml`).
    -   **PR Checks (Linting)**: Mandatory **ESLint** checks ensuring 100% code quality.
    -   **Testing Strategy**:
        -   **Unit Tests**: Mandatory Jest runs for both backend and frontend.
        -   **Integration Tests**: Validates interactions between API and Database.
    -   **Frontend Builds**: Ensures the production build is stable before merging.
-   **CD (Continuous Deployment)**: Automates the rollout to AWS EC2 using SSH.
-   **Dependabot**: Automatically monitors outdated/vulnerable dependencies weekly.

## 3. Design Decisions
-   **Testing Tools**: Standardized on **Jest** for speed and **Playwright** for reliable browser-level E2E flows.
-   **UI Design**: A high-end monochrome aesthetic prioritizing visual simplicity and high-quality photography.
-   **Idempotent Scripting**: Deployment scripts use `mkdir -p` and `pm2 restart` patterns to ensure multiple runs don't cause operational failures.

## 4. Challenges Faced
-   **CI Optimization**: Managing large `node_modules` caches (solved with `actions/setup-node` caching).
-   **Database Mocking**: Ensuring integration tests are 100% reliable in isolated CI runners (solved using `mongodb-memory-server`).
-   **UI Performance**: Balancing high-quality photography with fast initial page loads.

---
*Created as part of the DevOps & Advanced Web Development Evaluation.*
