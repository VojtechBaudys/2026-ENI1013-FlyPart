<div align="center">
   <img width="1918" height="1091" alt="Screenshot 2026-02-19 130115" src="https://github.com/user-attachments/assets/da048b4c-578f-4420-b8e9-5a3144b40f13" />
</div>

# Flypart Dashboard 🚁

A real-time fleet management and telemetry dashboard designed for monitoring autonomous drone deliveries and logistics networks. 

**🚀 Live Demo:** [Flypart Dashboard on Google Cloud Run](https://partfly-45715626815.us-west1.run.app/)

---

## 🌟 Overview

The Flypart Dashboard provides a comprehensive, centralized view of your active delivery fleet. It allows dispatchers and operators to monitor live telemetry, track active drop-offs, and view automated network events on an interactive map. 

**Note:** This project was developed and refined with the help of [Google AI Studio](https://aistudio.google.com/).

## ✨ Key Features

* 🛰️ **Live Telemetry:** Monitor real-time metrics for individual units, including altitude, speed, battery percentage, signal strength, and satellite connectivity.
* 🗺️ **Interactive Fleet Map:** Visualize your entire operation with a dark-mode map (powered by Leaflet & OpenStreetMap) showing active drones, delivery hubs, and precise on-site drop locations.
* 📦 **Active Delivery Tracking:** Keep tabs on the current item manifest, item weight, assigned tradesperson, drop-off address, and estimated time of arrival (ETA).
* 📋 **Active Fleet Overview:** A quick-glance panel showing the status (e.g., `EN ROUTE`, `RETURNING TO BASE`), battery life, and altitude of all active units in the network.
* 📜 **Network Events Log:** A live-updating terminal feed of auto-dispatch events, system notifications, and routing updates.

---

## 🛠️ Built With

* **Mapping:** Leaflet / OpenStreetMap
* **Deployment:** Google Cloud Run
* **AI Assistance:** [Google AI Studio](https://aistudio.google.com/)

---

## 💻 Getting Started

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/flypart-dashboard.git](https://github.com/yourusername/flypart-dashboard.git)
    cd flypart-dashboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

4.  **Open your browser:** Navigate to `http://localhost:3000` (or the port specified in your console) to view the dashboard.
