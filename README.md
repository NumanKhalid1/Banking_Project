# Banking Application

A modern banking application built with Next.js, TypeScript, and PostgreSQL.

## Features

- Create bank accounts with IBAN validation
- Deposit money to accounts
- Withdraw money from accounts
- Transfer money between accounts
- View account statements with transaction history
- Responsive design (supports 360px minimum width)
- Full TypeScript support
- Automated testing
- CI/CD pipeline

## Tech Stack

- **Frontend**: Next.js 14 with App Router, Chakra UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest, React Testing Library
- **Form Handling**: React Hook Form with Zod validation
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js 20 or later
- Docker and Docker Compose
- Git

## Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd banking-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the PostgreSQL database:

   ```bash
   docker-compose up -d
   ```

4. Set up the environment variables:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your database connection string:

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5431/banking_db"
   ```

5. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate test coverage report:

```bash
npm run test:coverage
```

## Database Management

Generate Prisma client:

```bash
npx prisma generate
```

Create a new migration:

```bash
npx prisma migrate dev --name <migration-name>
```

Reset the database:

```bash
npx prisma migrate reset
```

## Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/         # API routes
│   │   └── page.tsx     # Main page component
│   ├── components/      # React components
│   │   ├── AccountForm.tsx
│   │   ├── TransactionForm.tsx
│   │   └── AccountStatement.tsx
│   └── lib/            # Utility functions and configurations
├── prisma/             # Database schema and migrations
├── public/            # Static assets
└── tests/            # Test files
```

## API Endpoints

### `POST /api/account`

Create a new bank account

- Body: `{ iban: string }`
- Response: Account object

### `GET /api/account`

Get all accounts

- Response: Array of account objects

### `POST /api/transaction`

Process a transaction

- Body: `{ type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER', amount: number, fromAccountId?: string, toAccountId?: string }`
- Response: Transaction object

### `GET /api/transaction`

Get transactions for an account

- Query: `accountId`
- Response: Array of transaction objects

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the MIT License.
