# Home Hub

You are a senior full-stack MERN engineer and UI/UX designer.

Build a COMPLETE, WORKING, production-quality Real Estate Portal called "EstateFlow".

IMPORTANT:

Do not create only a UI prototype. Build a FUNCTIONAL full-stack application where all buttons, forms, filters, authentication flows, favorites, property management and admin actions actually work.

Use the following stack:

FRONTEND:

- React

- Vite

- React Router

- Tailwind CSS

- Axios

BACKEND:

- Node.js

- Express.js

- REST APIs

DATABASE:

- MongoDB

- Mongoose

AUTHENTICATION:

- JWT

- bcrypt

IMAGE STORAGE:

- Cloudinary (use environment variables)

====================================================

PROJECT GOAL

====================================================

EstateFlow is a modern real estate platform where users can browse properties for sale or rent, search and filter properties, view detailed information, save favorite properties and contact property owners.

There must also be an Admin Dashboard where an administrator can manage users, properties and inquiries.

The website must look like a modern real estate startup, similar in quality and UX to Zillow, Airbnb, NoBroker or Housing.com, but do not copy their branding.

====================================================

FRONTEND DESIGN

====================================================

Create a premium, modern and clean UI.

Design requirements:

- Modern real estate startup aesthetic

- Clean spacing

- Large beautiful property images

- Responsive design for desktop, tablet and mobile

- Smooth subtle animations

- Modern cards

- Professional typography

- Sticky navigation

- Loading states

- Empty states

- Error states

- Toast notifications

Use a neutral premium color palette with one elegant accent color.

Do NOT create a generic college project interface.

====================================================

PAGES

====================================================

1. HOME PAGE

Sections:

- Modern navigation bar

- Logo: EstateFlow

- Hero section with real estate background/image

- Headline:

  "Find a place you'll love to call home."

- Search bar with:

    - Location

    - Buy/Rent

    - Property Type

    - Search button

Below hero:

- Featured Properties

- Popular Locations

- Browse by Property Type

- Why Choose EstateFlow

- Call to Action

- Footer

Featured property cards must fetch real data from the backend.

----------------------------------------------------

2. PROPERTIES PAGE

Display all properties in a responsive grid.

Each property card should display:

- Image

- Price

- Property title

- Location

- Bedrooms

- Bathrooms

- Area

- Property type

- Buy/Rent badge

- Favorite heart button

Implement:

- Search

- Location filter

- Buy/Rent filter

- Property type filter

- Minimum price

- Maximum price

- Bedrooms

- Sorting:

  - Newest

  - Price Low to High

  - Price High to Low

Filters must communicate with the backend using query parameters.

Implement pagination.

----------------------------------------------------

3. PROPERTY DETAILS PAGE

Display:

- Image gallery

- Property title

- Price

- Location

- Description

- Bedrooms

- Bathrooms

- Area

- Amenities

- Property type

- Listing type

- Date posted

Include:

- Favorite button

- Share button

- Contact Owner form

Contact form fields:

- Name

- Email

- Phone

- Message

Submitting the form must create an inquiry in the backend database.

Show related properties below.

----------------------------------------------------

4. AUTHENTICATION

Create:

/register

/login

Registration fields:

- Name

- Email

- Password

- Phone number

Login fields:

- Email

- Password

Requirements:

- Password hashing using bcrypt

- JWT authentication

- Store JWT securely

- Protected frontend routes

- Auth middleware on backend

- Logout functionality

- Show logged-in user in navbar

Create a User model with:

name

email

password

phone

role

favorites

createdAt

Roles:

- user

- admin

----------------------------------------------------

5. FAVORITES PAGE

Route:

/favorites

Users can:

- Add property to favorites

- Remove property from favorites

- View all saved properties

Favorites must persist in MongoDB.

If the user is not logged in and clicks favorite:

redirect them to login.

----------------------------------------------------

6. USER PROFILE

Route:

/profile

Show:

- Name

- Email

- Phone

- Account creation date

Allow:

- Edit profile

- View favorite properties

- View submitted inquiries

----------------------------------------------------

7. ADMIN DASHBOARD

Route:

/admin

Only accessible to users with role = admin.

Create a professional dashboard.

Dashboard statistics:

- Total Users

- Total Properties

- Active Properties

- Total Inquiries

Admin sections:

A. PROPERTY MANAGEMENT

Admin can:

- Create property

- Edit property

- Delete property

- View all properties

- Change property status

Property fields:

title

description

price

location

propertyType

listingType

bedrooms

bathrooms

area

amenities

images

owner

status

createdAt

Property Types:

- Apartment

- House

- Villa

- Plot

- Commercial

Listing Types:

- Sale

- Rent

Status:

- Active

- Pending

- Sold

----------------------------------------------------

B. USER MANAGEMENT

Admin can:

- View users

- Search users

- Delete users

- Change user role

----------------------------------------------------

C. INQUIRY MANAGEMENT

Admin can:

- View all inquiries

- View property associated with inquiry

- View user/contact information

- Change inquiry status

Inquiry statuses:

- New

- Contacted

- Closed

----------------------------------------------------

DATABASE MODELS

====================================================

Create proper Mongoose schemas and relationships.

USER MODEL:

{

  name,

  email,

  password,

  phone,

  role: "user" | "admin",

  favorites: [Property ObjectId],

  createdAt

}

PROPERTY MODEL:

{

  title,

  description,

  price,

  location,

  propertyType,

  listingType,

  bedrooms,

  bathrooms,

  area,

  amenities: [],

  images: [],

  owner: User ObjectId,

  status,

  createdAt,

  updatedAt

}

INQUIRY MODEL:

{

  property: Property ObjectId,

  senderName,

  senderEmail,

  senderPhone,

  message,

  status,

  createdAt

}

Use proper validation.

====================================================

BACKEND API

====================================================

Implement REST APIs.

AUTH:

POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

PUT /api/auth/profile

PROPERTIES:

GET /api/properties

Support query parameters:

search

location

listingType

propertyType

minPrice

maxPrice

bedrooms

sort

page

limit

GET /api/properties/:id

POST /api/properties

PUT /api/properties/:id

DELETE /api/properties/:id

FAVORITES:

POST /api/users/favorites/:propertyId

DELETE /api/users/favorites/:propertyId

GET /api/users/favorites

INQUIRIES:

POST /api/inquiries

GET /api/inquiries/my

ADMIN:

GET /api/admin/stats

GET /api/admin/users

DELETE /api/admin/users/:id

GET /api/admin/inquiries

PUT /api/admin/inquiries/:id

Protect APIs with JWT middleware.

Create admin authorization middleware.

====================================================

IMAGE UPLOAD

====================================================

Implement Cloudinary image upload.

Requirements:

- Multiple images per property

- Image preview before upload

- Delete selected image

- Store Cloudinary URLs in MongoDB

Use environment variables:

MONGODB_URI

JWT_SECRET

CLOUDINARY_CLOUD_NAME

CLOUDINARY_API_KEY

CLOUDINARY_API_SECRET

Never hardcode secrets.

====================================================

ERROR HANDLING

====================================================

Implement:

- Centralized Express error handler

- Proper HTTP status codes

- Validation errors

- Unauthorized errors

- Forbidden errors

- Not found errors

Frontend must display user-friendly error messages.

====================================================

PROJECT STRUCTURE

====================================================

Create a clean structure.

Frontend:

frontend/

src/

  components/

  pages/

  services/

  context/

  hooks/

  utils/

Backend:

backend/

  controllers/

  models/

  routes/

  middleware/

  config/

  utils/

====================================================

IMPORTANT FUNCTIONAL REQUIREMENTS

====================================================

Every button must work.

Do not create fake buttons.

Do not leave TODO comments for important features.

Do not use static mock data after backend integration.

All property data must come from MongoDB.

All filters must work with backend APIs.

Authentication must work end-to-end.

Favorites must persist after logout/login.

Contact forms must save inquiries.

Admin CRUD must actually modify MongoDB.

Use loading states while fetching API data.

Use toast notifications for actions.

Handle API errors properly.

====================================================

SEED DATA

====================================================

Create a database seed script.

Generate at least 12 realistic properties located in India.

Use locations such as:

- Ranchi

- Delhi

- Mumbai

- Bangalore

- Hyderabad

Create:

- 1 admin account

- Multiple normal users

- 12+ properties

====================================================

FINAL CHECK

====================================================

Before considering the project complete:

1. Check every route.

2. Check every button.

3. Test registration.

4. Test login.

5. Test protected routes.

6. Test property filters.

7. Test favorites.

8. Test inquiries.

9. Test admin authorization.

10. Test property CRUD.

11. Fix compilation errors.

12. Fix broken imports.

13. Fix API endpoint mismatches.

14. Ensure frontend and backend communicate correctly.

Do not stop after generating files.

Continue checking the application for errors and fix all errors until the project runs successfully.

At the end provide:

1. Complete project structure

2. Installation instructions

3. Environment variable examples

4. Commands to run frontend and backend

5. Seed database command

6. Admin login credentials for development

Build this project now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/df951a8b-c16f-4b18-9526-92266815021d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
