# Anime & Manga Tracker

Anime & Manga Tracker is a full-stack MERN application designed to help users discover, track, and manage their favorite anime and manga series. Users can search for titles using the Jikan API (which sources data from MyAnimeList) and save them to a personalized inventory. The application features separate views for exploring new media and managing saved entries.

## ✨ Features

*   **Search & Discover:** Explore a vast library of anime and manga titles using the Jikan API.
*   **Personalized Inventory:** Save anime and manga entries to your personal list.
*   **Detailed Information:** View comprehensive details for each title, auto-populated from the Jikan API.
*   **RESTful API:** Backend built with Express.js, providing a robust API for managing data.
*   **Mongoose Models:** Structured data management with Mongoose schemas for Anime, Manga (and a User model planned).
*   **Reusable Components:** Frontend built with React, featuring reusable media card components for a consistent UI.
*   **Client-Side Routing:** Smooth navigation between Explore and Inventory pages using React Router.
*   **Secure Configuration:** MongoDB URI managed securely via a `.env` file.
*   **(Planned) JWT Authentication:** User authentication and authorization will be implemented using JSON Web Tokens.

## 🛠️ Tech Stack

*   **Frontend:**
    *   React (Manually configured with Webpack and Babel, no Create React App)
    *   Vanilla CSS (No CSS frameworks like Tailwind or Bootstrap)
    *   React Router
*   **Backend:**
    *   Node.js
    *   Express.js
*   **Database:**
    *   MongoDB (Atlas)
    *   Mongoose (ODM)
*   **API Integration:**
    *   Jikan API (for MyAnimeList data)
*   **Development Tools:**
    *   Webpack
    *   Babel
    *   Nodemon
    *   Concurrently

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (v9.x or later recommended) or yarn
*   MongoDB Atlas Account (or a local MongoDB instance)

### Setup Instructions

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/anime-manga-tracker.git
    cd anime-manga-tracker
    ```
    *(Replace `your-username/anime-manga-tracker.git` with your actual repository URL)*

2.  **Install Backend Dependencies:**
    Navigate to the `server` directory (or your backend's root) and install dependencies:
    ```bash
    cd server
    npm install
    # or if you use yarn:
    # yarn install
    cd ..
    ```

3.  **Install Frontend Dependencies:**
    Navigate to the `client` directory and install dependencies:
    ```bash
    cd client
    npm install
    # or if you use yarn:
    # yarn install
    cd ..
    ```

4.  **Create `.env` File:**
    In the `server` directory (or your backend's root), create a `.env` file and add your MongoDB connection string:
    ```
    MONGO_URI=your_mongodb_connection_string_here
    ```
    Replace `your_mongodb_connection_string_here` with your actual MongoDB Atlas URI. It typically looks like: `mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority`

### Running the Application

You can run the frontend and backend servers separately or concurrently.

1.  **Run the Backend Server (Express + Node):**
    From the `server` directory (or your backend's root):
    ```bash
    npm run dev
    ```
    This will typically start the server on `http://localhost:5000` (or the port you've configured).

2.  **Run the Frontend Development Server (React):**
    From the `client` directory:
    ```bash
    npm start
    ```
    This will typically open the application in your browser at `http://localhost:3000` (or the port configured by Webpack).

3.  **Run Both Frontend and Backend Concurrently:**
    If you have `concurrently` set up in your root `package.json` (recommended):
    From the project's root directory (`anime-manga-tracker`):
    ```bash
    npm run dev
    ```
    This command will start both the backend and frontend servers simultaneously. (Ensure your root `package.json` has a script like: `"dev": "concurrently \"npm run dev --prefix server\" \"npm run start --prefix client\""`)

## 🎯 Learning Objectives / Developer Goals

The primary goal of this project is to reinforce and solidify MERN stack knowledge by:

*   Building a full-stack application from scratch.
*   Gaining hands-on experience with MongoDB, Express.js, React, and Node.js.
*   Understanding and implementing a RESTful API.
*   Managing application state in React.
*   Setting up a React development environment manually with Webpack and Babel.
*   Integrating with third-party APIs (Jikan API).
*   Implementing user authentication (JWT - planned).
*   Practicing modern JavaScript (ES6+) features.
*   Styling with Vanilla CSS for a deeper understanding of CSS fundamentals.

## 📸 Screenshots (Optional)

![Screenshot 2025-05-14 at 9 12 59 PM](https://github.com/user-attachments/assets/4f679f28-251b-4a02-9777-ae0d8360e781)
![Screenshot 2025-05-14 at 9 13 47 PM](https://github.com/user-attachments/assets/5fe5c869-1637-4a3f-abc6-6927006ebf84)
![Screenshot 2025-05-14 at 9 12 48 PM](https://github.com/user-attachments/assets/98072916-9e46-408d-8dd4-97a2b92719ec)



## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details (if you add one).
*(If you don't have a LICENSE.md, you can state: Distributed under the MIT License.)*

## 🙏 Acknowledgements

*   **Jikan API:** For providing free access to MyAnimeList data.
*   **MyAnimeList:** As the underlying source of the anime and manga data.


---

Happy Coding!
