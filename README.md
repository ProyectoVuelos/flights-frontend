# Flights Frontend

[![Build Status](https://img.shields.io/travis/com/your-username/flights-frontend.svg?style=flat-square)](https://travis-ci.com/your-username/flights-frontend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A modern web application for searching, viewing, and booking flights. This project provides the user interface for the Flights platform, connecting to backend services to deliver real-time flight information.

## ✨ Features

*   **Flight Search:** Search for one-way or round-trip flights between any two destinations.
*   **Filtering & Sorting:** Filter results by airport, aircraft model & date.
*   **Flight Details:** View detailed information for each flight, including layovers and amenities.
*   **Responsive Design:** A clean and intuitive interface that works seamlessly on desktop and mobile devices.

## 🚀 Tech Stack

This project is built with a modern frontend stack:

*   **Framework:** [Next.js](https://nextjs.org/) with [React](https://reactjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/) 
*   **Backend Integration:** REST API
*   **Styling:** Tailwind CSS
*   **UI Components:** [Radix UI](https://www.radix-ui.com/)

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have the following software installed on your machine:

*   [Node.js](https://nodejs.org/en/) (v16.x or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/flights-frontend.git
    cd flights-frontend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    # or
    yarn install
    ```

### Environment Variables

This project requires a connection to Google Cloud services. You'll need to set up your environment variables.

1.  Create a `.env.local` file in the root of the project:
    ```sh
    touch .env.local
    ```

2.  Add the necessary environment variables.

    Run:

    ```bash
    cp .env.example .env.local
    ```

    Your `.env.local` might look like this:
    ```env
    NEXT_PUBLIC_BACKEND_URL=...
    ```

    **Ask a project administrator for the credentials!**

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode.\
Open http://localhost:3000 to view it in the browser.

The page will reload if you make edits. You will also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles the app in production mode and optimizes the build for the best performance.


## 📜 License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.
