# Simple E-Wallet System

A simple RESTful E-Wallet System developed using Spring Boot.

## Technologies Used

* Java 21
* Spring Boot
* Spring Data JPA
* Spring Security
* JWT Authentication
* H2 Database
* Maven
* OpenAPI / Swagger
* JUnit 5
* Mockito
* Postman

## Features

* User registration and management
* User authentication using JWT
* Password encryption using BCrypt
* Wallet management
* Deposit money
* Withdraw money
* Transfer money between wallets
* Transaction history
* Input validation
* Global exception handling
* Pagination
* API documentation using OpenAPI

## Database

The project uses an H2 in-memory database.

**Database URL:**

`jdbc:h2:mem:ewalletdb`

**H2 Console:**

`http://localhost:8080/h2-console`

**Username:** `sa`

**Password:** empty

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/sandyeissa43/simple-ewallet-system.git
```

### 2. Build the project

For Windows:

```bash
mvnw.cmd clean install
```

### 3. Run the application

```bash
mvnw.cmd spring-boot:run
```

The application will run on:

`http://localhost:8080`

## Authentication

The application uses JWT authentication.

Users must log in to obtain a JWT token and use it to access protected endpoints.

## API Testing

The APIs were tested using Postman, including:

* Registration
* Login
* User management
* Wallet operations
* Deposits
* Withdrawals
* Transfers
* Transaction history
* Validation and error scenarios

## API Documentation

Swagger UI:

`http://localhost:8080/swagger-ui/index.html`

## Testing

Unit testing was implemented using:

* JUnit 5
* Mockito
* Spring Boot Test

## Project Structure

```text
src/main/java
└── com.vois.simpleewalletsystem
    ├── config
    ├── controller
    ├── dto
    ├── entity
    ├── enums
    ├── exception
    ├── repository
    ├── security
    └── service
```

## Project Purpose

This project was developed as part of the VOIS internship program to demonstrate REST API development, database management, authentication, security, validation, and unit testing using Spring Boot.

