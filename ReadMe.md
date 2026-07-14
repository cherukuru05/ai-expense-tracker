# FinTrack AI - Complete Guide

This guide covers everything you need to know to run the full project locally on your machine and how to deploy it to the cloud.

---

## 💻 1. Running Locally (Windows)

Your project consists of 4 parts: MongoDB (Database), Express API (Backend), Python (ML Service), and React (Frontend).

### The Easiest Way (One-Click)
1. Go to your project folder: `C:\Users\cheru\Desktop\Ai financial Tracker`
2. Double-click the **`start-all.bat`** file.
3. This will automatically open three background windows for MongoDB, Backend, and ML Service.
4. Finally, open a terminal in the `frontend` folder and run `npm run dev` to start the UI.
5. Open your browser to `http://localhost:5173`.

### The Manual Way (Terminal by Terminal)
If you prefer to start them individually, open 4 separate command prompts:

**Terminal 1: Database (MongoDB)**
```bash
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "D:\mongodb_data" --port 27017
```

**Terminal 2: Backend API**
```bash
cd backend
npm install
node src/server.js
```

**Terminal 3: Frontend (React UI)**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 4: Machine Learning Service (Optional but recommended)**
```bash
D:\ml_env\Scripts\python.exe ml-service\main.py
```

---

## 🚀 2. Deploying to the Cloud

To share your project with the world, we need to deploy the database, backend, and frontend.

### Step 1: Push code to GitHub
Before deploying, make sure all your code is saved to GitHub:
```bash
git add .
git commit -m "Final project setup"
git push origin main
```

### Step 2: Setup MongoDB Atlas (Cloud Database)
Local MongoDB won't work on the internet.
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Create a Free Cluster (M0).
3. Under "Database Access", create a Database User with a password.
4. Under "Network Access", add IP address `0.0.0.0/0` to allow all connections.
5. Click **Connect** -> **Connect your application** and copy the Connection String.
   *(It looks like: `mongodb+srv://<username>:<password>@cluster0.../fintrack`)*

### Step 3: Deploy Backend & Frontend to Vercel
Vercel is the easiest way to host React + Express apps.

1. Go to [Vercel](https://vercel.com/) and create a free account using your GitHub.
2. Click **Add New...** -> **Project**.
3. Import your `ai-expense-tracker` repository from GitHub.
4. Open the **Environment Variables** section before deploying and add:
   * Name: `MONGODB_URI` | Value: *(Paste your MongoDB Atlas string here)*
   * Name: `JWT_SECRET` | Value: `your_super_secret_random_string`
   * Name: `VITE_API_URL` | Value: `/api`
5. Click **Deploy**.

Vercel will automatically read the `vercel.json` file we created earlier, build your React frontend, and turn your Express backend into serverless functions!

Once the build is done, Vercel will give you a live URL (e.g., `https://fintrack-ai.vercel.app`) that you can share on your resume.
