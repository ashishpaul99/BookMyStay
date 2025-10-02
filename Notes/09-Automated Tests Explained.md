# 9. Automated Tests Explained 03-42-00
- In this course, we will focus on **End-to-End (E2E)** testing.
- E2E testing involves testing the application exactly as the user would use it.
- For example, when we manually tested the registration and login process using the UI, an End-to-End test automates that same flow.
## 9.1 How End-to-End (E2E) works
- We start the frontend and backend folders on the local host, which spins up the app on our local machine.
- The app is connected to a development database set up on mongodb.com.
- For End-to-End (E2E) tests, we create a separate database specifically for testing.
	1. This allows us to control the test data that goes into the database.
	2. As a result, tests remain consistent and predictable, since they always run against known data.
	3. This ensures reliable outcomes
- We don’t use the existing development database for testing because:
	- While developing, new data keeps getting added or modified.
	- This makes the dataset inconsistent, which would lead to unreliable test results.
	 ![](Images/Pasted%20image%2020251002161717.png)
## 1. Running Automated End-to-End Tests with Playwright
- Once we set up the **test database**, we start the app on localhost just like we normally would.  
- In a separate project, we create our automated tests.
- The "robot" here is our test runner (using Playwright).
	- It starts up and opens a browser.
	- It navigates to our web application (running on localhost).
	- It then performs automated tests on the website, just like we did manually before.
	- After completing the tests, it generates a report showing which tests passed and which failed.
	 ![](Images/Pasted%20image%2020251002161736.png)
## 9.2 Setting Up Playwright and an End-to-End Test Database
- Install Playwright and set up the End-to-End (E2E) test environment.
- Go to MongoDB and create a new project → e2e-test-db.
- Create a new database and copy the connection string.
- Create a new environment file specifically for E2E testing: .env.e2e.
- This allows us to start the backend in two modes:
	- Development mode → connects to our existing database.
	- E2E Test mode → connects to the new test database (e2e-test-db).
- In .env.e2e, define the database connection string pointing to the E2E test database.
- Also, add JWT_SECRET_KEY and FRONTEND_URL in .env.e2e.
- The reason for having these variables is that whenever we start our backend server in test mode, it still needs to know values like JWT_SECRET_KEY and the frontend URL, because the app is going to behave in exactly the same way as in development.
- He said that environment files are isolated, so whichever one we tell the app to use when starting, it will ignore all the others.
- **backend/.env.e2e**
```env
MONGODB_CONNECTION_STRING=mongodb+srv://ashishpaul99:password@cluster0.exm5h3r.mongodb.net/e2e-test-db?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET_KEY=6b028aedd15181d89aeffdb9d4bcb95a877b3f415662c6646749715ccfdcd1dcc3de6fdcc4612b50a1d95d90a81e11e4ccc773d940fdfdaba5af7d3b57f2a955
FRONTEND_URL=http://localhost:5173
```

## 1. Configuring Backend to Use the E2E Environment File

- Now that we’ve created an End-to-End test environment file, we need to tell the backend to use this specific file.
- Now that we’ve created an End-to-End test environment file, we need to tell the backend to use this specific file.
- We can do this by adding a new script to our `package.json`
- In the backend, install cross-env → `npm i cross-env`
- Add a script to run E2E: → `backend/package.json`
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node ./src/index.ts",
    "build": "npm install && npx tsc",
    "start": "node ./dist/index.js",
    "e2e": "cross-env DOTENV_CONFIG_PATH=.env.e2e nodemon"
  }
}
```

## 2. Log Database Connection in index.ts
- Go to the index.ts file in backend/src.
- Log a message when the database is connected to show which database is being used.
- Print the message to confirm the connection:
```ts
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database:",   process.env.MONGODB_CONNECTION_STRING))
  .catch((err) => console.error("Database connection error:", err));

```

**Cmd: npm run dev**
```bash
Ashishpaul@DESKTOP-12AGMBF MINGW64 ~/Desktop/Hotel Booking App/backend (main)
$ npm run dev

> hotel-booking-backend@1.0.0 dev      
> nodemon --exec ts-node ./src/index.ts

[nodemon] 3.1.10
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: ts,json      
[nodemon] starting `ts-node ./src/index.ts` 
http://localhost:7000/
server is running on port 7000
Connected to database: mongodb+srv://ashishpaul99:Password@hotel-booking-app-db.cnftan3.mongodb.net/?retryWrites=true&w=majority&appName=hotel-booking-app-db
```

**Cmd: npm run e2e**
```bash
Ashishpaul@DESKTOP-12AGMBF MINGW64 ~/Desktop/Hotel Booking App/backend (main)
$ npm run e2e

> hotel-booking-backend@1.0.0 e2e
> cross-env DOTENV_CONFIG_PATH=.env.e2e nodemon

[nodemon] 3.1.10
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: ts,json
[nodemon] starting `ts-node ./src/index.ts`
http://localhost:7000/
server is running on port 7000
Connected to database: mongodb+srv://ashishpaul99:Ashish777@cluster0.exm5h3r.mongodb.net/e2e-test-db?retryWrites=true&w=majority&appName=Cluster0
```

###  **Remove Test Code from index.ts**
- Delete any temporary code you added for testing purposes.
- Remove the console.log statement that prints the connection string for security reasons.
- We just set up the database, so now we can install Playwright and write some End-to-End tests.



