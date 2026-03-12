# 🛡️ Insurance Management System
A full-stack implementation of an Insurance Claims Management System leveraging Domain-Driven Design (DDD) and Angular Front-end. This system manages the lifecycle of insurance claims, from submission via a reactive Angular frontend to processing through a robust, decoupled backend.

## 🏗️ Architecture Overview

This project is split into two main ecosystems, ensuring a strict separation of concerns and scalability.

### 🌐 Frontend (Angular)

The frontend is a modern, standalone-component-based Angular application designed for performance and maintainability.

* **Reactive UI:** Built using Angular Reactive Forms for complex validation logic.
* **Service-Oriented:** Data flow is managed via centralized services and RxJS Observables.
* **Real-time Feedback:** Integrated `ToastService` for non-blocking user notifications.
* **Type Safety:** Strict TypeScript interfaces (Models) that mirror the backend API contracts.

### ⚙️ Backend (DDD & Clean Architecture)

The backend follows Domain-Driven Design principles to protect business logic from external infrastructure.

* **Domain Layer:** Contains the "Heart of the Software"—Entities, Value Objects, and Domain Events.
* **Application Layer:** Coordinates tasks and delegates work to domain objects.
* **Infrastructure Layer:** Handles database persistence, external API integrations, and logging.
* **API Layer:** A RESTful interface that communicates with the frontend via standardized DTOs (Data Transfer Objects).

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Angular 17+, RxJS, CSS3 (BEM) |
| **Backend** | .NET / Java (DDD Implementation) |
| **Data** | SQL Server / PostgreSQL |
| **DevOps** | Git, GitHub |

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+) & Angular CLI
* [Backend Runtime: .NET SDK / JDK]
* A running instance of [Database Name]

### Installation

1. **Clone the repo:**
```bash
git clone https://github.com/JChristopher-Dev/InsuranceAgency.git

```


2. **Setup Backend:**
```bash
cd insurance-Backend
# Run InsuranceAgency.API

```


3. **Setup Frontend:**
```bash
cd insurance-frontend
npm install
ng serve

```



---

## 📁 Project Structure

```text
├── insurance-frontend/      # Angular Standalone Project
│   ├── src/public/core/        # Publicly used resources
│   ├── src/app/environments/        # Environmental variables
│   ├── src/app/core/        # Services, Models, and Guards
│   ├── src/app/shared/      # Global Components (Toasts, Loaders)
│   └── src/app/components/  # Feature modules (Claims, Policies)
├── insurance-Backend/       # DDD Backend
│   ├── InsuranceAgency.API/              # Business Logic & Entities
│   ├── InsuranceAgency.Data/         # Contains all business rules, entities, and core logic independent of any external technology.
│   ├── InsuranceAgency.Domain/         # Manages the retrieving of data from the database or communicating with external file systems.
│   └── InsuranceAgency.slnx/      # Main solution of the program
└── README.md
