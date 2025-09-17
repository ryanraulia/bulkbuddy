# BulkBuddy 🍴💪  

BulkBuddy is a **full-stack web application** designed to simplify nutrition planning for individuals pursuing **muscle gain, weight management, or healthier eating habits**. It provides personalised **meal plan generation, nutrition calculators, recipe discovery, and community-driven recipe sharing** — all in one platform. Unlike many existing tools that lock key features behind paywalls, BulkBuddy is **completely free and inclusive**.  

---

## 🚀 Features  

- **Meal Plan Generator**  
  Generate daily or weekly meal plans based on calorie targets, diet type (vegan, vegetarian, pescatarian, etc.), and ingredient exclusions.  

- **Calorie & Nutrition Calculators**  
  - *Calorie Surplus Calculator*: Calculates calorie goals and macronutrient breakdowns using Mifflin-St Jeor and Katch-McArdle equations.  
  - *Food Calorie Calculator*: Search and combine foods to calculate meal macros in real time.  

- **Recipes**  
  - Browse recipes from both **Spoonacular API** and **user-submitted content**.  
  - Advanced filters (macros, diet, cuisine, meal type, allergens).  
  - Recipe detail modals with instructions, nutrition, and “add to meal plan” option.  

- **Custom Meal Planning**  
  Create your own weekly or daily plans by assigning recipes to specific dates and meal types.  

- **User Accounts & Profiles**  
  - Register/Login securely with JWT authentication.  
  - Manage personal meal plans, recipes, and profile info.  
  - Upload a profile picture and track recipe contributions.  

- **Community Engagement**  
  - Submit your own recipes with images and nutrition breakdowns.  
  - Recipes undergo moderation before publication.  
  - Admin dashboard for recipe approval/rejection.  

- **Dark & Light Mode**  
  Accessible, clean UI with theme switching for user comfort.  

- **Contact Us Page**  
  Directly send feedback/messages via integrated email service.  

---

## 🛠️ Tech Stack  

### Frontend  
- **React.js** – component-based architecture  
- **Tailwind CSS** – responsive, minimal styling  
- **React Router** – navigation  
- **Context API** – authentication & theme management  

### Backend  
- **Node.js** with **Express.js** – RESTful APIs  
- **MySQL** – relational database (normalised to 3NF)  
- **JWT Authentication** – secure login sessions  
- **Multer** – file uploads for recipes/profile images  
- **Nodemailer** – contact form email handling  

### External APIs  
- **Spoonacular API** – recipes, meal planning, and nutrition data  

---

## 📂 Project Structure  

```
BulkBuddy/
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components (RecipeCard, Modals, Forms)
│   │   ├── pages/      # Main pages (Home, Recipes, Profile, Calculators, Admin)
│   │   ├── context/    # Auth & Theme Context
│   │   └── utils/      # Helper functions
│
├── server/             # Express backend
│   ├── controllers/    # Business logic for each feature
│   ├── routes/         # RESTful route definitions
│   ├── middleware/     # Authentication, uploads, validation
│   ├── models/         # MySQL database models
│   └── index.js        # Entry point
│
├── database/           # SQL schema & migrations
└── README.md           # Project documentation
```

---

## ⚡ Installation & Setup  

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-username/BulkBuddy.git
   cd BulkBuddy
   ```

2. **Install dependencies**  
   - Frontend  
     ```bash
     cd client
     npm install
     ```
   - Backend  
     ```bash
     cd server
     npm install
     ```

3. **Setup environment variables**  
   Create `.env` files for frontend & backend. Example for backend:  
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=bulkbuddy
   JWT_SECRET=your_jwt_secret
   SPOONACULAR_API_KEY=your_api_key
   ```

4. **Run the app**  
   - Start backend:  
     ```bash
     cd server
     npm run dev
     ```
   - Start frontend:  
     ```bash
     cd client
     npm run dev
     ```

5. Visit: **http://localhost:5173** 🎉  

---

## ✅ Testing  

- **Unit & Integration Tests**: Implemented with Jest + Supertest for backend.  
- **Manual Testing**: Conducted with Postman & cURL for API endpoints.  
- **Frontend Testing**: Feature validation across major browsers.  

---

## 🔒 Security  

- Passwords hashed with **bcrypt**.  
- JWT stored in **HTTP-only cookies** (protects from XSS).  
- Role-based access control for **admin features**.  
- Input validation & sanitisation on both client & server.  

---

## 🌱 Future Enhancements  

- Save dietary preferences to profiles for persistent filtering.  
- Add social features (liking/commenting on recipes).  
- Grocery list generation from meal plans.  
- Expand support for cultural dietary structures.  

---

## 👨‍💻 Author  

**Ryanvir Raulia**  
Dissertation Project – University of Liverpool (COMP390 2024/25)  
