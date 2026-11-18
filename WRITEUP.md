# CSC 317 — Group Project Milestone 3
## Fog & Fern — Back-End JavaScript and Database Integration

**Team:** Team Pacific (Group 38)  
**Course:** CSC 317 — Web Development, Fall 2026  
**Repository:** https://github.com/ats-sfsu/csc317-f26-group-project-group-38

**Team members**
- **Kazi Porash** — [KaziPorash](https://github.com/KaziPorash)
- **Cindy Licea** — [CindyStella518](https://github.com/CindyStella518)

## 1. Project overview

Fog & Fern is a houseplant and plant-essentials storefront based in San Francisco. In Milestone 2, we built the website with HTML, CSS, and front-end JavaScript. For Milestone 3, we kept the original layout and added a Node.js/Express backend connected to PostgreSQL. The website now retrieves product information from the database and saves user accounts, contact messages, newsletter subscriptions, and practice orders.

The main data flow is **browser → Express API → PostgreSQL → Express API → browser**. The site is a class project, so checkout records an order but does not process actual payments.

## 2. Features implemented

**Express backend and APIs.** We organized the backend into `server.js`, the `routes/` directory, `middleware/`, and `db/`. All HTML, CSS, front-end JavaScript, and images remain in `public/`. Express serves the site, accepts JSON requests, and returns responses to the browser.

**PostgreSQL integration.** The backend connects through `pg` using credentials loaded from `.env`. The `/api/health` endpoint checks the connection with a database query. The project also includes the SQL schema, initial product data, and a database backup file.

**Dynamic product catalog.** The shop and home pages request products through `/api/products`. Individual product details are available through `/api/products/:id`. Prices, stock availability, and product information are read from PostgreSQL rather than a hardcoded JavaScript product list.

**User authentication.** Visitors can register, sign in, and sign out. Passwords are hashed using `bcryptjs`, and login sessions are stored in PostgreSQL through `express-session` and `connect-pg-simple`. Signed-in users can see their account dashboard and order history.

**Database write operations.** The contact form uses `POST /api/contact` to save messages. Newsletter sign-ups are saved through `POST /api/newsletter`. Registration saves new users, and checkout creates practice orders and order-item records. Order totals are calculated on the server using database prices, and product stock is updated in the same transaction.

**Existing front end.** We retained the home page, product pages, collection filters, shopping bag, checkout, confirmation page, contact page, care information, FAQ, and responsive styling from Milestone 2.

## 3. Database schema

| Table | Primary key | Purpose and relationships |
| --- | --- | --- |
| `users` | `id` | Stores customer accounts and hashed passwords. One user can have many orders. |
| `products` | `id` | Stores the product catalog, prices, categories, and stock. Referenced by order items. |
| `orders` | `id` | Stores practice checkout details and totals. `user_id` references `users.id`. |
| `order_items` | `id` | Stores products and quantities in each order. References `orders.id` and `products.id`. |
| `contact_messages` | `id` | Stores messages submitted on the contact page; optionally references a signed-in user. |
| `newsletter_subscribers` | `id` | Stores unique newsletter email addresses. |
| `session` | `sid` | Stores active login sessions for Express. |

The schema uses primary keys, foreign keys, uniqueness constraints, and checks for valid prices, quantities, and stock levels. Prices are stored in cents to avoid rounding issues.

## 4. Challenges and solutions

One challenge was replacing the static Milestone 2 product data without changing the design. We updated the front-end JavaScript to use `fetch()` and display data returned from the product API while keeping the existing cards, filters, and product pages.

Connecting the local PostgreSQL database also required careful configuration. While setting up the project in our Ubuntu Vagrant environment, we encountered a password-loading issue caused by a special character in the `.env` file. Quoting the password correctly allowed `dotenv` to load it for the PostgreSQL connection.

We also needed to protect account data and order information. We used password hashing, server-side sessions, parameterized SQL queries, and authentication checks on account-specific order routes. For checkout, the backend validates product IDs and quantities, reads current prices from the database, and saves an order using a transaction.

## 5. Testing and verification

We tested the project locally in the Ubuntu Vagrant environment with PostgreSQL. Our checks covered the server/database connection, database-backed product loading, account registration and login/logout, submitting contact messages, and the main storefront flow. We also checked database records through PostgreSQL while testing the message and API functionality.

The project includes automated tests in `tests/order-logic.test.js`. These check that invalid or duplicate order items are rejected and that checkout totals use database prices. The two order-logic tests passed during source validation. The HTML page references and JavaScript syntax were also checked.

## 6. Team contributions

**Kazi Porash (`KaziPorash`)**
- Built and organized the front-end HTML pages and page structure in Milestone 2.
- Worked on the Milestone 3 integration of the existing front end with Express and PostgreSQL.
- Set up the PostgreSQL connection in the Vagrant development environment and tested the database-backed functionality, including the contact-message flow.
- Checked the application behavior and prepared the milestone documentation.

**Cindy Licea (`CindyStella518`)**
- Developed the website's CSS styling in Milestone 2, including colors, typography, spacing, and page layouts.
- Contributed the responsive styling and visual design that were retained across the Milestone 3 storefront, product pages, forms, and account pages.

We continued using the same group repository and kept the completed Milestone 2 version under the `HTMLCSS` Git tag.

## 7. Known limitations

Fog & Fern remains a class demonstration rather than a production online store. Checkout saves **practice orders only**; no real payment gateway, shipping service, automatic email delivery, or admin management panel is connected. The shopping bag still uses browser `localStorage`, so it does not automatically sync between devices. Checkout currently supports California delivery addresses.

## 8. Use of GenAI

We used Gemini to help adapt the Milestone 2 website for the Express/PostgreSQL backend, organize the API and database code, troubleshoot setup issues, create test cases, and draft documentation. For Milestone 2, Gemini assisted with parts of the styling, front-end interactions, and project organization. We reviewed the work and tested the integrated website in our development environment.

## 9. Database export and import

The repository includes `db/schema.sql`, `db/seed.sql`, and `backup.sql` for the PostgreSQL database. These are the commands used for the plain-SQL export and restore workflow:

```bash
pg_dump -h localhost -U fogfern_user -F p fogfern_db > backup.sql
psql -h localhost -U fogfern_user -d fogfern_db -f backup.sql
```

The project also provides `npm run db:export`, which uses the database settings in `.env` to generate `backup.sql`. Credentials are kept in the local `.env` file; `.env.example` is included for configuration without exposing passwords.
