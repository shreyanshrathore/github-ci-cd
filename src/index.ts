import express from "express";

const app = express();

app.listen(3000, () => console.log("Hello from 3000"));

app.get("/health", (req, res) => res.send("Hello server is up"));

console.log("Hello World");
export const sayHello = (name: string) => `Hello, ${name}`;
