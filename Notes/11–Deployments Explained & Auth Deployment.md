# 11–Deployments Explained & Auth Deployment
 ` 4:22:00`
- Deploy the auth code to the deployment environment to ensure everything is working properly
## 11.1 How Deployments Work at High level
- Before deploying to **Render.com**, the frontend and backend code is pushed to **GitHub**.
- GitHub notifies **Render.com** that new changes are available and need to be deployed.
- Render.com checks out the code, builds the frontend and backend, packages everything, and deploys it to their servers.
- A **URL i**s provided, which can be used to access both the frontend and backend.
- Every time we push code to **GitHub**, Render.com automatically detects the changes and redeploys.
- In this course, the frontend code is bundled as part of the backend Node server, so everything is kept together and deployed on a single server.
- This approach makes it easier to manage configuration, settings, and deployment since everything is within a single project.
- Alternatively, the frontend and backend can be deployed on **separate servers**. This is the standard approach for large-scale applications (multiple backend servers handling traffic with a single frontend server). But for simplicity, we deploy both on the same server here.

![](Images/Pasted%20image%2020251003172259.png)
## 11.2 Deployment Build Scripts
`04:24:00`
### 1. Configure Backend Build Scripts
- Set up build scripts needed for deploying to **Render.com**.
- Configure backend scripts to build the backend server.
- In the backend folder, check if a `tsconfig.json` file exists.
	- If not, create it using: `npx tsc --init
- In `tsconfig.json`, set: `"outDir": "./dist"`  → This defines the folder where the compiled backend code will be placed.
- In the backend `package.json`, add two scripts:
	1. Build Script →  `"build": "npm install && npx tsc"` 
		- Installs dependencies and compiles TypeScript into the `./dist` folder.
	2. **Start script** → `"start": "node ./dist/index.js"
		- Runs the compiled backend server using Node. The entry point is `index.js` in the `dist` folder (all TypeScript is stripped during the build, leaving plain JavaScript).
		- Inside the `dist` folder, we will see the **same folder structure** as in `src`, but all files are converted to **JavaScript** instead of TypeScript.
- these are the scripts render.com will use to build and start our code before deploying it to their server.

- **Difference between `build` and `start` scripts**
	1. build  → Prepares the code for deployment  
		- Compiles TypeScript (`.ts`) files into JavaScript (`.js`) and outputs them to the `dist` folder. Usually also installs dependencies if needed. Example: `"build": "npm install && npx tsc"`
	 2.  start  →  Runs the application
		- Uses Node to execute the compiled JavaScript in the `dist` folder. Example: `"start": "node ./dist/index.js"`
	- You **must run `build` first** if your code is in TypeScript; otherwise `start` won’t find the `.js` files.
### 2. Configure Frontend Build Scripts
- Open `package.json` in the **frontend** folder.
- Add the build script:`"build": "tsc -b && vite build"
	- This compiles TypeScript and uses **Vite** to convert React code into **JavaScript, HTML, CSS**, and other assets needed for deployment.
- After running:  `npm run build`  → a **`dist`** folder is created.
	- The React and TypeScript code is stripped out during the build process, leaving only **plain HTML, CSS, and JavaScript**.
`
```bash
$ npm run build

> frontend@0.0.0 build
> tsc -b && vite build

vite v7.1.5 building for production...
✓ 98 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-CYgAAWHE.css    8.57 kB │ gzip:  2.59 kB
dist/assets/index-Bec4VVTA.js   287.13 kB │ gzip: 91.58 kB
✓ built in 4.25s
```
## 11.3 Serving Frontend Static Assets from Backend
- Instead of running the frontend on a separate server, we can serve it from the **backend** so both frontend and backend are on the same server.
- Open `index.ts` in the **backend/src** folder.
- Use **Express** to serve the compiled frontend static assets from the `dist` folder of the frontend:
- **backend/src/index.ts**
```ts
import path from "path";
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
```
- This tells Express to serve all files in the `dist` folder as static assets.
- Now, the backend can handle **API requests** (e.g., `/api/auth`, `/api/users`) **and** serve the frontend app on the same URL.
- `import path from "path"` is needed to correctly construct the path to the frontend `dist` folder across all operating systems.
## 11.4 Running Backend with Frontend Assets
- In the terminal, go to the **backend** folder.
- Run the build command: `npm install && npx tsc
	- This creates a new **production build** and puts everything into the `dist` folder.
- Start the backend server: `npm start`
	- This runs the compiled code in the `dist` folder.
- Visit `http://localhost:7000/` → You will see the frontend served from the backend. No need to start the frontend separately.
- This approach bundles the **frontend and backend together**, so deploying just the backend is enough, and everything is served on a single URL — convenient for this course.
- **Note:** This setup is usually **not used in development** because:
	- Multiple build steps are required.
	- Updates are slower; hot-reloading is not available.
	- Development typically runs frontend and backend separately for faster iteration.
## 11.5 Handling API Requests in a Bundled Deployment
- When frontend and backend are **bundled together**, the frontend requests automatically go to the same server.
- Open `api-client.ts` in the **frontend/src** folder.    
- The `API_BASE_URL` is usually specified for development when frontend and backend run on **separate servers**:.
```TS
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "" ;
```
- In production, when both are bundled, `API_BASE_URL` is **empty** (`""`), so fetch requests go to the **same server** as the frontend.
- This ensures the frontend can make API requests without needing a separate backend URL.
- You can **test the deployment build locally** to verify that both frontend and backend are working together.
## 11.6 Test the deployment build locally
- **test the deployment build locally** to verify that both frontend and backend are working together.
### 1. Build the Frontend 
- Go to the **frontend** folder.
- Run the build command to compile the latest code into a production-ready format.
- This creates the **dist** folder containing the compiled frontend assets.

```bash
cd frontend
npm run build
```

```bash
Ashishpaul@DESKTOP-12AGMBF MINGW64 ~/Desktop/Hotel Booking App (main)
$ cd frontend

Ashishpaul@DESKTOP-12AGMBF MINGW64 ~/Desktop/Hotel Booking App/frontend (main)
$ npm run build

> frontend@0.0.0 build
> tsc -b && vite build

vite v7.1.5 building for production...
✓ 98 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-CYgAAWHE.css    8.57 kB │ gzip:  2.59 kB
dist/assets/index-Bec4VVTA.js   287.13 kB │ gzip: 91.58 kB
✓ built in 3.22s
```
### 2. Build the Backend
- Go to the **backend** folder.
- Run the build command to compile the backend TypeScript code.
- The backend build also includes the **bundled frontend assets**, packaging everything together into the `dist` folder for deployment.
```bash
cd backend
npm run build
```
### 3. Start the Server and Deploy
 - Start the server locally: `npm start`
- This runs the same build that will be deployed on **Render.com**.
- Open `http://localhost:7000/` (or your backend URL) to verify that the site is working.
- After confirming locally, **create a GitHub repository**, push your code, and deploy it to Render.com.
## 11.7 Setup GitHub
`04:32:00`
- Create a new repository on GitHub.
- Initialize Git locally: `git init`
- Add a **.gitignore** file at the **top level** of your project.
	- Purpose: Excludes certain files/folders (like `node_modules`, `.env`, `.vscode`) from being committed to the repository.
- Deploy your project to the GitHub repository.
- Setup a render account and deploy project code.
**.gitignore file**
```gitignore
# Node modules
node_modules/

# Env files
backend/.env
backend/.env.e2e
frontend/.env

# VSCode settings
.vscode/

# Build outputs
backend/dist/
frontend/dist/
```

## 11.8 MongoDB Security Settings
`04:36:00`

  

