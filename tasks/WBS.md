# Work Breakdown Structure

## Milestones

### Milestone:1 Project Setup and Configuration: 
- **Status:** todo
- **Priority:** medium
- **Due:** N/A

This section outlines the necessary steps to set up the development environment for the Agri-Tech web application, including installation of tools, folder structure, and required packages for both frontend and backend development.

1. Create a React + Vite Project Setup
Instead of Create React App, we will use Vite for a faster development experience.

Create the root project folder:
mkdir agritech
cd agritech

Create separate folders for Client and Server:
mkdir Frontend
mkdir Backend

2. Create Project Folders and Files
Organize the project using a clean and scalable folder structure:

Client Folder (Frontend) 
Contains all React code such as components, pages, routes, and styles. 

Commands for Frontend setup : 
npm create vite@latest client -- --template react
cd client
npm install

Server Folder (Backend)
Hosts the Express server, API routes, database models, and middleware.

Commands for Backend Setup : 
mkdir server
cd server
npm init -y
=> Once the separate Frontend and Backend folders are created, set up the following folder structure in each of them.
   
3. Install Required Packages
Once the folders are set, navigate into each and install the necessary packages.

### Milestone 2: Backend Development: 
- **Status:** todo
- **Priority:** medium
- **Due:** N/A

Backend npm Packages
Install in the /server directory:
npm install express mongoose cors dotenv

Express – Minimal web framework for creating the API server.

Mongoose – ODM (Object Data Modeling) tool for MongoDB.

CORS – Middleware to enable cross-origin requests between frontend and backend.

Dotenv – Loads environment variables from a .env file for secure key management.

Nodemon 
=> index.js (Root file)
Entry point of the backend (Express server setup).

Configures:
cors for cross-origin requests.
body-parser/express.json() for parsing JSON payloads.
Routes imported from routes/.
Loads environment variables from .env and starts the server.

=> controllers/
Each file in this folder handles business logic and interacts with Mongoose models.
adminController.js:
 Manages admin-specific actions like verifying users, viewing reports, system analytics, etc.
bookingController.js:
 Handles service or equipment booking-related logic — creating, updating, and viewing bookings.
cropController.js:
 Logic for managing crops: adding crop details, monitoring stages, applying treatments, etc.
farmController.js:
 Handles operations related to farm details like size, location, crop assignments, etc.
productController.js:
 Manages inventory-like products such as seeds, fertilizers, pesticides — create, list, update.
userController.js:
 Includes user registration, login, profile update, and user-specific actions.
 Role: Keeps route handlers clean by offloading logic.

=>  db/
Stores database connection, schema models, and static JSON data.
config.js:
 Establishes MongoDB connection using Mongoose with credentials from .env.
Admin/, User/:
 These may contain Mongoose model files defining schema for admin and user collections.
crops.json:
 Static JSON containing crop data such as crop types, durations, pests, etc., for preloading or reference.

 => routes/
Handles HTTP routes for different parts of the app.
user.js:
 Contains routes for user registration, login, logout, and user-specific endpoints.
index.js:
 Main router file that aggregates and mounts all sub-routes under appropriate API paths (e.g., /api/users, /api/farms).

Role: Separates API endpoints from business logic and keeps route handling modular.
 => Authentication
Middleware protects private routes (e.g., dashboard, crop updates).
Authentication flow:
User registers or logs in.
Receives a token.
Token is sent in headers on protected requests.
Middleware verifies and authorizes user access.


### Milestone 3: Database development
- **Status:** todo
- **Priority:** medium
- **Due:** N/A

1. Configure MongoDB
To manage and persist user and application data, we use MongoDB — a flexible, document-oriented NoSQL database — in combination with Mongoose, which is an elegant ODM (Object Data Modeling) library for Node.js. This setup allows seamless interaction with the MongoDB database through JavaScript/TypeScript.
Step 1: Install Mongoose
Step 2: Create Database Connection
Step 3: Create Schemas & Models

2. Connect database to backend: 
            Now, make sure the database is connected before performing any of the actions through the backend. The connection code looks similar to the one provided below.
                                             
3. Configure Schema: 
         Firstly, configure the Schemas for MongoDB database, to store the data in such a pattern. Use the data from the ER diagrams to create the schemas.
The schemas are looks like for the Application. 

### Milestone 4: Frontend development 
- **Status:** todo
- **Priority:** medium
- **Due:** N/A

1. Setup React Application
This step involves initializing and preparing the base environment for frontend development:
Create a React Application:
 The project begins with creating a new React application using tools like create-react-app or Vite to scaffold the frontend structure. This generates essential configuration files and boilerplate code to kickstart development.
Configure Routing:
 React Router (commonly used) is configured to manage client-side routing. It helps navigate between different views and screens (such as login, signup, dashboard) without reloading the page, thus creating a seamless Single Page Application (SPA) experience.
Install Required Libraries:
 Additional libraries are installed to enhance development and user experience. This includes UI component libraries (like Material-UI or React Bootstrap), HTTP clients (like Axios or Fetch), form handling libraries, state management tools, and more.
Frontend npm Packages
Install in the /frontend directory:
npm install axios react-router-dom bootstrap react-bootstrap react-icons
Axios – For making HTTP requests from React to the backend.
React-Router-Dom – Enables navigation between components (pages) in a SPA.
Bootstrap – CSS framework for responsive design.
React-Bootstrap – Bootstrap components built specifically for React.
React-Icons – Collection of popular icon packs for UI design.
moment – used for handling time & date formatting
recharts – for data visualization
tailwindcss, vite, eslint – if you are showcasing the frontend stack fully


2. Design UI Components
In this phase, visual elements of the application are planned and implemented to ensure usability and consistency:
Create Components:
 The interface is modularized by dividing it into reusable components such as buttons, forms, headers, and cards. This promotes reusability and maintainability across the application.
Implement Layout and Styling:
 A responsive and visually appealing layout is created using CSS, CSS-in-JS libraries, or utility frameworks like Tailwind CSS. The design ensures compatibility across screen sizes and devices.
Add Navigation:
 Logical and intuitive navigation is implemented using navbar, sidebar, or drawer components. Routing logic ensures users can move between different sections easily, maintaining context and session state as needed.


3. Implement Frontend Logic
This step focuses on making the frontend dynamic by connecting it to the backend and managing real-time user interactions:
Integration with API Endpoints:
 The frontend interacts with backend services via HTTP requests. APIs handle operations such as user registration, login, data retrieval, and updates. Proper handling of responses and errors ensures data integrity and user feedback.
Implement Data Binding:
 User inputs and application state are managed using React’s state management system. This enables real-time updates to the UI as the user interacts with the app. Two-way binding ensures form values reflect state and vice versa, enhancing interactivity.


4. API integration:  
The Weather Forecast component integrates real-time weather data into the application by consuming the OpenWeatherMap API. This public RESTful API provides detailed meteorological data based on geographic coordinates or city names. It enables the frontend to display temperature, humidity, wind speed, and other weather metrics for the user’s current or searched location.
 => Getting the OpenWeatherMap API Key
To use the OpenWeatherMap API, follow these steps to obtain an API key:
Visit https://home.openweathermap.org/users/sign_up 
Create a free account or log in.
Navigate to the API Keys section of your profile.
Generate a new API key (or use the default one provided).
Copy this API key — it will be used in the API endpoints mentioned below.

=>  Key API Endpoints Used:
1. Get Weather by Coordinates (Auto-Detection)
https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={API_KEY}&units=metric
Called immediately upon component mount.
Uses the browser’s Geolocation API to retrieve the user’s current latitude and longitude.
These coordinates are passed to the endpoint to fetch weather data for the current physical location.
2. Get Weather by City Name (Manual Search)
https://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}&units=metric
Used when a user manually types a city name and presses the Search button or hits Enter.
Fetches and displays weather data for the searched city.


=> Frontend Integration Flow
Automatic Location Detection:
Use navigator.geolocation.getCurrentPosition() to get the user's coordinates.
Pass these coordinates to the OpenWeatherMap API endpoint.
Parse and display the response:
Temperature
Humidity
Wind Speed
Atmospheric Pressure
Weather Description
Weather Icon (based on condition)
Manual Location Search:
The user enters a city name in the search input field.
On clicking the "Search" button:
Make an API call using the entered city name.
Retrieve and display the respective weather information on the UI.

### Milestone 5: Project Implementation
- **Status:** todo
- **Priority:** medium
- **Due:** N/A

Run the Complete Application and start backend and frontend servers:
Backend
cd Backend
npm start

Frontend
cd Frontend
npm run dev

Project Screenshots:
Finally, after finishing coding the projects we run the whole project to test it’s working process and look for bugs. Now, let’s have a final look at the working of our  Agri-Tech.

