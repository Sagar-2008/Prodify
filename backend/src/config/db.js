import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "prodify_user",
  password: "prodify123",
  database: "prodify"
});
