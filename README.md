# Restaurant Ordering and Inventory Management System

## Project Overview

A comprehensive web-based Restaurant Ordering and Inventory Management System designed to streamline restaurant operations, manage inventory efficiently, and process customer orders seamlessly.

### Group Information
- **Group Name:** DBMS Restaurant Team
- **Members:**
  - Akshay Ashok Bannatti
  - Bishworup Adhikari

## Technology Stack

### Frontend
- **Framework:** React.js with Vite
- **UI Library:** Bootstrap 5
- **HTTP Client:** Axios
- **State Management:** React Context API / Redux (if needed)
- **Routing:** React Router v6

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** JSON Web Tokens (JWT)
- **Database Driver:** mysql2
- **Validation:** express-validator
- **Security:** bcrypt, helmet, cors

### Database
- **DBMS:** MySQL 8.0+
- **Normalization:** 3NF (Third Normal Form)
- **Management Tool:** MySQL Workbench

### Development Tools
- **IDE:** Visual Studio Code
- **API Testing:** Postman
- **Version Control:** Git & GitHub
- **Package Manager:** npm

## System Features

### Core Functionality
1. **Order Management**
   - Place new orders
   - View order history
   - Update order status
   - Process payments
   - Generate receipts

2. **Inventory Management**
   - Track ingredient stock levels
   - Real-time inventory updates
   - Low stock alerts
   - Inventory valuation reports
   - Waste tracking

3. **Menu Management**
   - Add/Edit/Delete menu items
   - Category management
   - Recipe management (ingredients per dish)
   - Pricing management

4. **Supplier Management**
   - Supplier information tracking
   - Purchase order management
   - Supplier performance analytics

5. **Customer Management**
   - Customer registration
   - Order history tracking
   - Contact information management

6. **Reporting & Analytics**
   - Sales reports
   - Inventory reports
   - Cost analysis
   - Revenue tracking
   - Performance dashboards

### User Roles
- **Admin:** Full system access
- **Manager:** Order and inventory management
- **Staff:** Order processing and basic inventory viewing
- **Kitchen Staff:** View orders and update preparation status

## Project Structure

```
DBMS/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   └── index.html
└── database/
    ├── schema.sql
    └── seed.sql
```

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd DBMS
```

2. **Setup Database**
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE restaurant_management;

# Import schema
mysql -u root -p restaurant_management < database/schema.sql

# Import seed data (optional)
mysql -u root -p restaurant_management < database/seed.sql
```

3. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm start
```

4. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

5. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## Frontend Implementation Plan (TDD + Premium UI)

### Objectives
- Deliver a production-ready React frontend that exercises every completed backend capability (orders, inventory, reservations, suppliers, analytics).
- Follow strict Test-Driven Development (TDD): write failing tests → implement UI → refactor.
- Provide a cohesive, beautiful UI using **Bootstrap 5.3**, **Bootstrap Icons**, and complimentary libraries where needed (Charts, Tables, Forms).

### UI Toolkit & Libraries
- **Layout & Components**: Bootstrap 5.3, React-Bootstrap (grid, cards, navbars), Bootstrap Icons for status and affordances.
- **Charts**: Recharts (dashboard KPIs), Chart.js wrapped via `react-chartjs-2` for trend lines and doughnuts.
- **Tables & Data Grids**: `@tanstack/react-table` with Bootstrap styling for paging, sorting, filters.
- **Forms**: React Hook Form + Yup for validation, Bootstrap floating labels.
- **State/Data**: React Query for API caching + optimistic updates, Axios instance with interceptors.
- **Testing**: Vitest + React Testing Library for unit/integration, Cypress (or Playwright) for E2E, Storybook snapshot tests for critical components.

### TDD Workflow
1. **Define Acceptance Criteria** based on backend capabilities (reference *_COMPLETE.md files).
2. **Author Failing Tests**:
    - Component/unit tests (Vitest + RTL).
    - Integration tests for routes and shared providers.
    - Cypress spec stubs for end-to-end happy paths.
3. **Implement UI** adhering to Bootstrap design system and accessibility guidelines.
4. **Refactor & Visual Polish** (spacing, responsive breakpoints, iconography).
5. **Regression Run** (unit + integration + E2E + lint) before merging.

### Release Plan (4 Frontend Sprints)

| Sprint | Focus | Key Pages/Components | Primary Tests |
|--------|-------|----------------------|---------------|
| **F1 – Auth & Shell** | Login, JWT handling, role-based layout | Auth pages, persistent sidebar, top navbar with user menu, route guards | Auth form validation tests, layout snapshot, protected-route integration tests |
| **F2 – Dashboard & Analytics** | Real-time KPIs powered by `/analytics` endpoints | Multi-card KPI grid, revenue trend chart, low stock list, PO status timeline | Chart rendering snapshot, data hook mocking tests, analytics E2E (manager role) |
| **F3 – Operations** | Orders, Reservations, Tables | Order board (cards + drag statuses), reservation calendar (FullCalendar or Bootstrap calendar), table status heatmap | Order creation form tests, reservation conflict validation tests, E2E covering dine-in order flow |
| **F4 – Inventory & Supply Chain** | Inventory, Suppliers, Purchase Orders | Inventory data grid with inline filters, supplier detail modals, PO wizard with stepper, low stock automation banner | Inventory table sorting tests, PO wizard step tests, E2E for auto-generated PO approval |
| **F5 – Menu & Recipes** | Menu CRUD, recipes, availability toggles | Category manager with nested accordions, menu item form with cost preview chip, recipe matrix, image uploader | Form validation tests, image upload mock tests, availability recalculation integration test |
| **F6 – Reporting & Admin Tools** | Profit analysis, staff performance, audit tools | Report builder (filters + export), staff leaderboard, download buttons, printable views | Report filter state tests, profit chart snapshot, exporting E2E |

### Page-Level Details & UI Highlights
- **Global Shell**: Fixed sidebar (icons + labels), collapsible on mobile, color-coded role badges, dark/light toggle.
- **Dashboard**: Responsive 12-col grid, KPI cards with contextual icons, trend charts, alert banners (Bootstrap alerts) for low stock and pending approvals.
- **Orders**: Kanban board (react-beautiful-dnd) styled with Bootstrap cards, inline timers, kitchen mode (full-screen dark theme).
- **Inventory**: Data table with colored stock pills (danger for low, warning for medium, success for healthy), quick actions (adjust, view history, create PO).
- **Purchase Orders**: Stepper wizard (Bootstrap progress + icons), supplier lookup modals, timeline view for status transitions.
- **Menu & Recipes**: Photo gallery cards, recipe modal showing ingredient chips with availability icons, cost vs price sparkline.
- **Analytics**: Tabs for overview/sales/profit, interactive charts, download buttons with icons, skeleton loaders for faster perceived performance.

### Testing Matrix
- **Unit Tests**: Hooks (e.g., `useOrders`, `useInventoryStats`), UI atoms (buttons, badges).
- **Component Tests**: Forms, tables, charts with mocked data.
- **Integration Tests**: Page-level flows (creating PO updates inventory, order creation triggers inventory deduction UI states).
- **E2E Tests**:
   1. Manager login → dashboard renders KPIs.
   2. Staff creates dine-in order → inventory gauge updates.
   3. Manager runs low-stock auto-PO → PO list reflects new draft → approve flow.
   4. Admin reviews analytics report export.
- **Visual Regression**: Storybook stories for critical components with Chromatic or Loki snapshots.

### Developer Experience
- Shared Axios client with interceptors for token refresh + loading indicators.
- `DesignSystem` directory holding theme tokens (colors, spacing, typography) aligned with Bootstrap variables.
- Reusable `FeatureGuard` component enforcing RBAC on routes and buttons.
- Mock Service Worker (MSW) layer to support isolated component tests using backend contract data from *_COMPLETE.md.

### Deployment Readiness
- `.env` driven API base URL.
- Lighthouse checks (PWA-friendly optional).
- Bundle analysis to keep dashboard fast (<200KB initial JS target).
- Theming ready for white-label (CSS variables).

## API Documentation

API endpoints are organized into the following modules:

- **/api/auth** - Authentication and authorization
- **/api/orders** - Order management
- **/api/menu** - Menu item management
- **/api/inventory** - Inventory tracking
- **/api/suppliers** - Supplier management
- **/api/customers** - Customer management
- **/api/reports** - Analytics and reporting

Detailed API documentation available in `API_DOCUMENTATION.md`

## Database Design

The database follows a normalized relational model (3NF) with the following key entities:

- **Users & Roles** - Authentication and authorization
- **Customers** - Customer information
- **Menu_Items** - Available dishes
- **Ingredients** - Raw materials
- **Suppliers** - Vendor information
- **Inventory** - Stock tracking
- **Orders** - Order headers
- **Order_Details** - Order line items
- **Payments** - Payment transactions

See `DATABASE_DESIGN.md` for detailed schema information.

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Rate limiting
- Helmet.js security headers

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is developed for educational purposes as part of a Database Management Systems course.

## Contact

For questions or support, please contact the team members through the project repository.

## Acknowledgments

- Course: Database Management Systems
- Institution: [Your University Name]
- Semester: [Current Semester]
