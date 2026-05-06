# DataDeck – Project Report
## IN411 – Angular Frontend / Django Backend

**Students:**
- Ihab Haydaw – 59027
- Anthony Sfeir – 60622

---

## 1. Project Overview

DataDeck is a personal information management web application that allows users to organize various types of data — notes, tasks, movies, TV series, books, and games — into categorized cards. The application features a modern Angular frontend communicating with a Django REST backend, backed by a MongoDB (Atlas) database.

**Key Concept:** Unlike a typical e-commerce or library management system, DataDeck is a universal "deck of cards" where each card can represent any type of data. Users create, organize, filter, and manage their personal information through an intuitive card-based interface.

---

## 2. Models Description (MongoDB Collections)

Since the project uses MongoDB (NoSQL), models are represented as document collections rather than relational tables. Below is the schema design:

### 2.1 Users Collection
| Field      | Type     | Description                  |
|-----------|----------|------------------------------|
| `_id`     | ObjectId | Primary Key (auto-generated) |
| `username`| String   | Unique username              |
| `email`   | String   | **Email field** – unique, validated on frontend with `Validators.email` |
| `password`| String   | SHA-256 hashed password      |

### 2.2 Cards Collection
| Field             | Type       | Description                                          |
|-------------------|------------|------------------------------------------------------|
| `_id`             | ObjectId   | Primary Key                                          |
| `user_id`         | String     | **Foreign Key** → references `users._id`             |
| `title`           | String     | Card title (required)                                |
| `description`     | String     | Card description                                     |
| `master_tag`      | String     | Card type: note, task, movie, tv_series, book, game  |
| `tags`            | Array[String] | **Many-to-Many** → references tag names from `tags` collection |
| `image_url`       | String     | Image URL                                            |
| `image_data`      | String     | **File Image** – Base64 encoded uploaded image       |
| `image_urls`      | Array[String] | Additional image URLs                             |
| `urls`            | Array[String] | Associated external URLs                          |
| `document_data`   | String     | **File PDF** – Base64 encoded uploaded PDF document  |
| `document_name`   | String     | Original filename of the uploaded PDF                |
| `master_tag_data` | Object     | Type-specific fields (deadline, pages, episodes, etc.) |
| `created_at`      | String     | **Date field** – ISO creation timestamp              |
| `updated_at`      | String     | **Date field** – ISO last update timestamp           |

**Note on `master_tag_data`:** This nested object holds type-specific fields:
- **Task:** `deadline` (Date), `completed` (Boolean)
- **Movie:** `watched` (Boolean), `watch_date` (Date), `movie_url` (URL)
- **TV Series:** `season_count` (Number), `episodes_per_season` (Array), `watched_episodes` (Nested Array), `series_url` (URL)
- **Book:** `read` (Boolean), `read_date` (Date), `pages` (Number), `current_page` (Number), `rating` (Number), `book_url` (URL)
- **Game:** `completed` (Boolean), `completion_date` (Date), `hours_played` (Number), `platform` (String), `rating` (Number), `game_url` (URL)

### 2.3 Tags Collection
| Field        | Type     | Description                           |
|-------------|----------|---------------------------------------|
| `_id`       | ObjectId | Primary Key                           |
| `user_id`   | String   | **Foreign Key** → references `users._id` |
| `name`      | String   | Tag name (unique per user)            |
| `created_at`| String   | **Date field** – creation timestamp   |

### Relationships Summary
- **Users → Cards:** One-to-Many (via `cards.user_id` → `users._id`)
- **Users → Tags:** One-to-Many (via `tags.user_id` → `users._id`)
- **Cards ↔ Tags:** Many-to-Many (via `cards.tags` array referencing `tags.name`)

---

## 3. Application & Components Structure

### 3.1 Backend (Django + Django REST Framework)

```
backend/
├── datadeck/            # Django project settings
│   ├── settings.py      # MongoDB URI, CORS, REST config
│   ├── urls.py          # Root URL: api/ → api.urls
│   └── wsgi.py
├── api/                         # Main API application
│   ├── db.py                    # MongoDB connection helper (PyMongo)
│   ├── models/                  # Model layer (1 model per file)
│   │   ├── user_model.py        # User schema, hashing, lookups
│   │   ├── card_model.py        # Card schema, serialization, timestamps
│   │   └── tag_model.py         # Tag schema, serialization
│   ├── controllers/             # Controller layer (1 per screen)
│   │   ├── auth_controller.py   # Powers Login + Signup screens
│   │   ├── card_controller.py   # Powers Card Dashboard screen
│   │   ├── tag_controller.py    # Powers Tag Manager screen
│   │   ├── user_controller.py   # Powers Account screen
│   │   └── home_controller.py   # Powers Home screen
│   └── urls.py                  # API route definitions
├── .env                 # MONGODB_URI environment variable
└── requirements.txt     # Dependencies
```

### 3.2 Frontend (Angular)

```
frontend/src/app/
├── app.module.ts              # Root module (FormsModule, ReactiveFormsModule, HttpClient)
├── app-routing.module.ts      # Angular Router with 7 routes
├── app.component.*            # Shell layout with sidebar navigation
│
├── models/                        # TypeScript model interfaces (1 per file)
│   ├── card.model.ts              # Card interface
│   ├── user.model.ts              # User interface
│   └── tag.model.ts               # Tag interface
│
├── helpers/                       # Shared helper functions
│   └── card-form.helper.ts        # Card factory: createEmptyCard, createEditCardFromSource, buildCardPayload
│
├── login/                     # Login page (Reactive Form + Validators)
│   ├── login.component.ts
│   ├── login.component.html
│   └── login.component.css
│
├── signup/                    # Registration page (Reactive Form + Validators)
│   ├── signup.component.ts
│   ├── signup.component.html
│   └── signup.component.css
│
├── home/                      # Welcome/landing page
│   └── home.component.*
│
├── card-dashboard/            # Card management screen (search, filter, CRUD modals)
│   ├── card-dashboard.component.ts
│   ├── card-dashboard.component.html
│   └── card-dashboard.component.css
│
├── card-preview/              # Reusable card preview widget (grid thumbnail)
│   ├── card-preview.component.ts
│   ├── card-preview.component.html
│   └── card-preview.component.css
│
├── tags/                      # Tags management page
│   └── tags.component.*
│
├── settings/                  # App settings (theme, export, delete account)
│   └── settings.component.*
│
├── account/                   # User profile management
│   └── account.component.*
│
└── services/                  # Shared Angular services
    ├── auth.service.ts        # Authentication (login, signup, logout, profile)
    ├── cards.service.ts       # Cards CRUD HTTP calls
    ├── tags.service.ts        # Tags CRUD HTTP calls
    ├── theme.service.ts       # Dark/Light theme management
    ├── welcome.service.ts     # Welcome message API call
    └── master-tags.config.ts  # Master tag type definitions
```

---

## 4. URLs

### 4.1 Backend API Endpoints (Django)

| Method   | URL                              | Description                      |
|----------|----------------------------------|----------------------------------|
| `GET`    | `/api/welcome/`                  | Welcome message                  |
| `POST`   | `/api/signup/`                   | User registration                |
| `POST`   | `/api/login/`                    | User authentication              |
| `GET`    | `/api/cards/?user_id=`           | Get all cards for a user         |
| `POST`   | `/api/cards/create/`             | Create a new card                |
| `PUT`    | `/api/cards/<card_id>/update/`   | Update an existing card          |
| `DELETE` | `/api/cards/<card_id>/delete/`   | Delete a card                    |
| `GET`    | `/api/tags/?user_id=`            | Get all tags for a user          |
| `POST`   | `/api/tags/create/`              | Create a new tag                 |
| `DELETE` | `/api/tags/<tag_id>/delete/`     | Delete a tag                     |
| `PUT`    | `/api/user/update/`              | Update user profile              |
| `PUT`    | `/api/user/change-password/`     | Change password                  |
| `DELETE` | `/api/user/delete/?user_id=`     | Delete user account              |

### 4.2 Frontend Routes (Angular)

| Path         | Component          | Description              |
|-------------|-------------------|--------------------------|
| `/`         | → Redirect        | Redirects to `/login`    |
| `/login`    | LoginComponent     | Login page               |
| `/signup`   | SignupComponent    | Registration page        |
| `/home`     | HomeComponent      | Welcome dashboard        |
| `/cards`    | CardsComponent     | Cards management         |
| `/tags`     | TagsComponent      | Tags management          |
| `/settings` | SettingsComponent  | App settings             |
| `/account`  | AccountComponent   | User profile             |

---

## 5. Angular Concepts Used

### 5.1 Angular Reactive Forms
- **Login form:** Uses `FormBuilder` with `FormGroup` and `formControlName` directives
- **Signup form:** Uses `FormBuilder` with `FormGroup` and `formControlName` directives
- `ReactiveFormsModule` is imported in `app.module.ts`

### 5.2 Angular Validators
- **Signup:** `Validators.required`, `Validators.email`, `Validators.minLength(6)`
- **Login:** `Validators.required`, `Validators.minLength(6)`
- Validation error messages displayed inline when fields are touched and invalid

### 5.3 Angular Routing
- `AppRoutingModule` with `RouterModule.forRoot(routes)` defining 7 routes
- `routerLink` and `routerLinkActive` directives for sidebar navigation
- `Router.navigate()` for programmatic navigation after login/signup

---

## 6. Task Repartition

Each student is responsible for at least two MongoDB collections (tables) and develops both the Django backend models/controllers and Angular frontend pages for their assigned features.

### Anthony Sfeir – 60622
**Collections:** Users, Cards (2 tables)
- **Backend Models:** `user_model.py` (User schema, password hashing, query helpers), `card_model.py` (Card schema, serialization, timestamp helpers)
- **Backend Controllers:** `auth_controller.py` (Login, Signup), `card_controller.py` (CRUD), `user_controller.py` (Profile)
- **Frontend Pages:** Login page, Signup page, Account page (profile update, password change)
- **Features:** Image upload & viewing, Reactive Forms & Validators

### Ihab Haydaw – 59027
**Collections:** Tags, Cards (2 tables)
- **Backend Models:** `tag_model.py` (Tag schema, serialization), `card_model.py` (co-developed card schema extensions for master_tag_data)
- **Backend Controllers:** `tag_controller.py` (Tags CRUD), `home_controller.py` (Welcome)
- **Frontend Pages:** Card Dashboard (modals, search, filters), Tags page, Settings page, Home page
- **Features:** PDF upload & viewing, Card-preview component, Theme management (dark/light mode)

### Detailed Task Table

| Task                                    | Student               |
|-----------------------------------------|-----------------------|
| Backend setup (Django, MongoDB connection) | Ihab Haydaw – 59027 |
| User authentication (login/signup API)  | Anthony Sfeir – 60622 |
| Cards CRUD API (create, read, update, delete) | Anthony Sfeir – 60622 |
| Tags API and tag management             | Ihab Haydaw – 59027   |
| Angular frontend components & routing   | Ihab Haydaw – 59027   |
| Cards page UI (modals, search, filters) | Ihab Haydaw – 59027   |
| Image upload & viewing                  | Anthony Sfeir – 60622 |
| PDF document upload & viewing           | Ihab Haydaw – 59027   |
| Reactive Forms & Validators (login/signup) | Anthony Sfeir – 60622 |
| Settings & theme management             | Ihab Haydaw – 59027   |
| Account management & password change    | Anthony Sfeir – 60622 |
| Report writing                          | Both students         |
