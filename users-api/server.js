require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("Missing JWT_SECRET. Copy .env.example to .env and set a secret.");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, "data");
const usersFile = path.join(dataDir, "users.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, "[]", "utf8");

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersFile, "utf8"));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8");
}

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.get("/", (req, res) => {
  res.json({ message: "Users API is running" });
});

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    if (typeof name !== "string" || typeof email !== "string" ||
        typeof password !== "string") {
      return res.status(400).json({ message: "Invalid input types" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = readUsers();

    if (users.some(user => user.email === normalizedEmail)) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    const token = createToken(newUser);
    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: publicUser(newUser)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const users = readUsers();
    const user = users.find(item => item.email === normalizedEmail);

    if (!user || !(await bcrypt.compare(String(password), user.password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const token = createToken(user);
    return res.json({
      message: "Login successful",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all users (requires login)
app.get("/api/users", authenticateToken, (req, res) => {
  const users = readUsers().map(publicUser);
  res.json(users);
});

// Get current logged-in user
app.get("/api/users/me", authenticateToken, (req, res) => {
  const user = readUsers().find(item => item.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(publicUser(user));
});

// Get one user by ID (requires login)
app.get("/api/users/:id", authenticateToken, (req, res) => {
  const user = readUsers().find(item => item.id === req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(publicUser(user));
});

// Update current user's name/email
app.patch("/api/users/me", authenticateToken, (req, res) => {
  const { name, email } = req.body;
  const users = readUsers();
  const index = users.findIndex(item => item.id === req.user.id);

  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name must be a non-empty string" });
    }
    users[index].name = name.trim();
  }

  if (email !== undefined) {
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email must be a non-empty string" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailTaken = users.some(
      (item, i) => i !== index && item.email === normalizedEmail
    );

    if (emailTaken) {
      return res.status(409).json({ message: "Email is already in use" });
    }
    users[index].email = normalizedEmail;
  }

  writeUsers(users);
  res.json({
    message: "Profile updated successfully",
    user: publicUser(users[index])
  });
});

// Delete current user's account
app.delete("/api/users/me", authenticateToken, (req, res) => {
  const users = readUsers();
  const updatedUsers = users.filter(item => item.id !== req.user.id);

  if (updatedUsers.length === users.length) {
    return res.status(404).json({ message: "User not found" });
  }

  writeUsers(updatedUsers);
  res.json({ message: "Account deleted successfully" });
});

// JSON error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

app.listen(PORT, () => {
  console.log(`Users API running at http://localhost:${PORT}`);
});
