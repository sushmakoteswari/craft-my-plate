# Craft My Plate 🍲

## Making Craft My Plate the Ultimate Food Solution for Every Celebration! 🎉

### Project Overview
CraftMyPlate is a comprehensive food ordering platform that enables users to order food for various celebrations and events with role-based access control (RBAC).

## 🚀 Live Demo
- Website: [Craft My Plate](https://craft-my-plate-lovat.vercel.app/)
- GitHub Repository: [GitHub](https://github.com/sushmakoteswari/craft-my-plate)

## 🛠 Tech Stack
### Frontend:
- Next.js (React Framework)
- Tailwind CSS for styling
- Axios for API calls
- Shadcn UI components

### Backend:
- Node.js
- Express.js
- MongoDB (Database)
- Railway App (Backend Deployment)

## 🔐 Role-Based Access Control
The application implements three levels of access:
- **User:** Regular customers who can browse and order food.
- **Manager:** Additional privileges for order and menu management.
- **Admin:** Full system access and control over users, orders, and menu items.

## 🔑 Authentication (Backend Routes)
### Endpoints:
- **Login:** `/auth/login`
- **Register:** `/auth/register`

### Admin:
#### Manage Users:
- Fetch Users: `POST /adminusers`
- Update User: `PUT /adminusers/:id`
- Delete User: `DELETE /adminusers/:id`

#### Manage Menu:
- Add menu items: `POST /menu`
- Update menu items: `PUT /menu/:id`
- Remove menu items: `DELETE /menu/:id`
- View menu items: `GET /menu` (accessible to all users)

#### Orders:
- Place new order: `POST /order`
- View personal order history: `GET /order`
- View all orders (Admin & Manager only): `GET /order/allorders`
- Update order status (Admin & Manager only): `PUT /order/:id/status`

## 🌟 Key Features
- JWT-based secure authentication & authorization
- Role-based access control
- Responsive design with Tailwind CSS
- Modern UI with Shadcn components
- RESTful API architecture
- MongoDB integration

## 🚀 Deployment
### Frontend:
- Deployed on **Vercel** for optimal performance and reliability

### Backend:
- Hosted on **Railway App** for scalable server infrastructure

## ⚙️ Getting Started (Project Setup)
```sh
# Clone the repository
git clone https://github.com/sushmakoteswari/craft-my-plate.git

# Install dependencies (Frontend)
cd frontend
npm install
npm run build
npm run dev

# Install dependencies (Backend)
cd ../backend
npm install
npm run dev
```

## 🌍 Environment Variables
### Backend:
```sh
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Frontend:
```sh
NEXT_PUBLIC_API_BASE_URL=backend_api_url
```

## 📸 Screenshots
### Register Page:
**Error Handling for Empty Fields**

### Login Page:

## 🔧 Admin Dashboard (Future Implementations)
- Navigation:
- Admin Workflow Video: [View Here](https://drive.google.com/file/d/19ddoGR5T62K_t2-Zu-Uh542PlME9mGP4/view)

## 📌 User View
- [Home](https://craft-my-plate-lovat.vercel.app/Home)
- [Order History](https://craft-my-plate-lovat.vercel.app/Home/OrderHistory)
- [Cart](https://craft-my-plate-lovat.vercel.app/Home/Orders)

### Admin Workflow (Manage Users, Orders, Menu Items)
📹 [Watch Here](https://drive.google.com/file/d/1b_0MDDJ8CqnIizt6K83S23XjF_ueuyE/view?usp=sharing)

## 🔄 User Flow
1. View menu items
2. Add items to cart
3. Checkout & place order

## 🏢 Manager Navigation
- **Manage Users:** [Manager Dashboard](https://craft-my-plate-lovat.vercel.app/Manager)
- **Manage Orders:** [Manage Orders](https://craft-my-plate-lovat.vercel.app/Manager/ManageOrders)

---
**_Making celebrations more delicious, one plate at a time!_** 🎉🍽️

