 import React, { useState } from "react";
 import axios from "axios";
 import { useNavigate } from "react-router-dom";
 import "../styles/Auth.css";

 export default function Login() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const navigate = useNavigate();

   const handleSubmit = async (e) => {
     e.preventDefault();

     try {
       const res = await axios.post("http://localhost:5000/auth/login", {
         email,
         password,
       });

       localStorage.setItem("token", res.data.token);
       alert("Login successful ✅");
       navigate("/dashboard");
     } catch (err) {
       alert(err.response?.data?.message || "Login failed");
     }
   };

   return (
     <div className="auth-page">
       <div className="auth-card">
         <h2>Welcome back</h2>
         <p className="auth-sub">Log in to continue your journey</p>

         <form onSubmit={handleSubmit}>
           <label>Email</label>
           <input
             type="email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
           />

           <label>Password</label>
           <input
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
           />

           <button className="btn-primary auth-btn">Login</button>
         </form>
       </div>
     </div>
   );
 }
