# SPF-OMS — Swan Paper Fabrics Operations Management System

University Software Engineering Project — Local Setup Guide

---

## Requirements

Before you start, make sure you have **Node.js** installed.
Download it from: https://nodejs.org (choose the LTS version)

To check if it is already installed, open cmd and run:

```
node -v
npm -v
```

If both show a version number, you are good to go.

---

## Step 1 — Open the project in cmd

Press **Windows + R**, type `cmd`, hit Enter.

Then navigate to the project folder:

```
cd C:\Users\Mei\Swan-Paper-Factory-app
```

> Change `Mei` to your actual Windows username if different.

---

## Step 2 — Install dependencies (first time only)

```
npm install
```

This downloads all required packages. It takes 2–5 minutes the first time.
You only need to do this once.

---

## Step 3 — Run the app

```
npm run dev
```

Wait until you see something like:

```
  VITE ready in 500ms
  ➜  Local: http://localhost:5173/
```

Then open your browser and go to:

```
http://localhost:5173
```

---

## Step 4 — Log in

Select a role from the list and use the demo credentials below.

| Role | Username | Password |
|---|---|---|
| Founder / Owner | owner | swan2024 |
| Production Manager | prodmgr | prod123 |
| Machine Operator | operator | op123 |
| Delivery Driver | driver | drive123 |
| Packaging Worker | packing | pack123 |
| Inventory Manager | inventory | inv123 |
| Sales Clerk | sales | sales123 |
| Quality Inspector | qc | qc123 |

You can also click **Fill demo credentials** on the login screen.

---

## Step 5 — Stop the app

Go back to cmd and press:

```
Ctrl + C
```

Then type `Y` and hit Enter to confirm.

---

## How to push changes to GitHub

After modifying any file, run these commands in cmd from the project folder:

```
git add .
git commit -m "Describe what you changed"
git push origin main
```

---

## Troubleshooting

**npm is not recognized**
→ Node.js is not installed. Download it from https://nodejs.org

**Port already in use**
→ Another app is using port 5173. Stop it or restart your computer.

**npm install fails**
→ Check your internet connection and run `npm install` again.

**Login screen does not appear**
→ Make sure `__root.tsx` and `app-sidebar.tsx` were copied to the correct folders:
- `src\routes\__root.tsx`
- `src\components\app-sidebar.tsx`

**Changes not showing after editing a file**
→ The app hot-reloads automatically. If it does not, stop with Ctrl+C and run `npm run dev` again.

---

## Project structure (relevant files)

```
src/
  routes/
    __root.tsx        ← login screen + app shell
    index.tsx         ← dashboard page
    production.tsx    ← production management
    inventory.tsx     ← inventory management
    procurement.tsx   ← purchase orders
    sales.tsx         ← sales orders
    deliveries.tsx    ← delivery management
    machines.tsx      ← machine downtime / shifts
    quality.tsx       ← quality inspections
    workforce.tsx     ← workforce / shifts
    reports.tsx       ← reports
  components/
    app-sidebar.tsx   ← sidebar navigation (filtered by role)
  lib/
    spf-store.tsx     ← mock data and app state
```

---

Swan Paper Fabrics — SPF-OMS v1.0 — University Prototype
