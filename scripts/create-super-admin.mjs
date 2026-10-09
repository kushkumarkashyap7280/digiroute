#!/usr/bin/env node
/**
 * Creates THE super admin (or resets their password). Run it yourself, on your
 * own machine — it is a command-line tool, there is no HTTP route for it, and it
 * is never deployed (see .vercelignore).
 *
 *   ALLOW_SUPER_ADMIN_BOOTSTRAP=true npm run admin:create
 *   ALLOW_SUPER_ADMIN_BOOTSTRAP=true npm run admin:create -- --reset-password
 *
 * Safety rails — it refuses to run when:
 *   • it looks like a server/CI environment (NODE_ENV=production, VERCEL, CI),
 *   • ALLOW_SUPER_ADMIN_BOOTSTRAP=true is not set explicitly,
 *   • a super admin already exists (unless --reset-password),
 * and before writing to a non-local database it makes you type the DB name.
 * The password is typed at a hidden prompt — never passed on the command line.
 */

import readline from "node:readline";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const RESET = process.argv.includes("--reset-password");

function die(msg, code = 1) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(code);
}

// ── 1. environment guards ───────────────────────────────────────────────────
if (process.env.NODE_ENV === "production" || process.env.VERCEL || process.env.VERCEL_ENV || process.env.CI) {
  die("This script is disabled in production / server / CI environments.");
}
if (process.env.ALLOW_SUPER_ADMIN_BOOTSTRAP !== "true") {
  die(
    "Refusing to run. Set ALLOW_SUPER_ADMIN_BOOTSTRAP=true for this one command to confirm you mean it:\n" +
      "  ALLOW_SUPER_ADMIN_BOOTSTRAP=true npm run admin:create"
  );
}
const uri = process.env.MONGODB_URI;
if (!uri) die("MONGODB_URI is not set (it is read from .env.local by `npm run admin:create`).");

// ── helpers ─────────────────────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
const lines = []; // used when input is piped (tests / CI-less automation)
let pipedReady = null;
if (!process.stdin.isTTY) {
  pipedReady = new Promise((resolve) => {
    rl.on("line", (l) => lines.push(l));
    rl.on("close", resolve);
  });
}

async function ask(question, { hidden = false } = {}) {
  if (!process.stdin.isTTY) {
    await pipedReady;
    return (lines.shift() ?? "").trim();
  }
  return new Promise((resolve) => {
    if (!hidden) return rl.question(question, (a) => resolve(a.trim()));
    process.stdout.write(question);
    const out = rl.output;
    const original = rl._writeToOutput;
    rl._writeToOutput = () => {}; // don't echo the password
    rl.question("", (a) => {
      rl._writeToOutput = original;
      out.write("\n");
      resolve(a);
    });
  });
}

function passwordProblem(pw) {
  if (pw.length < 12) return "at least 12 characters";
  if (pw.length > 128) return "at most 128 characters";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "letters and numbers";
  if (new Set(pw).size < 5) return "less repetition";
  return null;
}

function describeTarget(u) {
  try {
    const url = new URL(u);
    return { host: url.host, db: url.pathname.replace(/^\//, "") || "(default)", local: /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(url.host) };
  } catch {
    return { host: "unknown", db: "(unknown)", local: false };
  }
}

// ── 2. confirm the target database ──────────────────────────────────────────
const target = describeTarget(uri);
console.log(`\nDatabase: ${target.db} on ${target.host} ${target.local ? "(local)" : "(REMOTE)"}`);
if (!target.local) {
  const typed = await ask(`This is a REMOTE database. Type its name ("${target.db}") to continue: `);
  if (typed !== target.db) die("Database name did not match. Nothing was changed.");
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
const admins = mongoose.connection.collection("admins");
const logs = mongoose.connection.collection("auditlogs");
await admins.createIndex({ email: 1 }, { unique: true });

const existing = await admins.findOne({ role: "super" });

// ── 3. reset mode ───────────────────────────────────────────────────────────
if (RESET) {
  if (!existing) die("There is no super admin to reset. Run without --reset-password to create one.");
  console.log(`Resetting the password of the super admin ${existing.email}`);
  const pw = await ask("New password: ", { hidden: true });
  const bad = passwordProblem(pw);
  if (bad) die(`Password needs ${bad}.`);
  if (pw !== (await ask("Repeat password: ", { hidden: true }))) die("Passwords did not match.");
  await admins.updateOne(
    { _id: existing._id },
    {
      $set: {
        passwordHash: await bcrypt.hash(pw, 12),
        mustChangePassword: false,
        failedLogins: 0,
        lockedUntil: null,
        status: "active",
        updatedAt: new Date(),
      },
      $inc: { sessionVersion: 1 }, // signs out every existing session
    }
  );
  await logs.insertOne({ adminId: existing._id, adminEmail: existing.email, action: "super.password-reset-cli", createdAt: new Date() });
  console.log("\n✔ Password updated. All previous sessions were signed out.\n");
  await mongoose.disconnect();
  process.exit(0);
}

// ── 4. create mode ──────────────────────────────────────────────────────────
if (existing) {
  die(`A super admin already exists (${existing.email}). There can only be one.\nForgot the password? Run:  ALLOW_SUPER_ADMIN_BOOTSTRAP=true npm run admin:create -- --reset-password`);
}

const name = await ask("Your name: ");
const email = (await ask("Your email (used to sign in): ")).toLowerCase();
if (name.length < 2) die("Name is too short.");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) die("That doesn't look like an email address.");
if (await admins.findOne({ email })) die("An admin with that email already exists.");

const pw = await ask("Password (12+ chars, letters and numbers): ", { hidden: true });
const bad = passwordProblem(pw);
if (bad) die(`Password needs ${bad}.`);
if (pw !== (await ask("Repeat password: ", { hidden: true }))) die("Passwords did not match.");

const now = new Date();
const { insertedId } = await admins.insertOne({
  email,
  name,
  passwordHash: await bcrypt.hash(pw, 12),
  role: "super",
  status: "active",
  mustChangePassword: false,
  sessionVersion: 0,
  failedLogins: 0,
  lockedUntil: null,
  createdAt: now,
  updatedAt: now,
});
await logs.insertOne({ adminId: insertedId, adminEmail: email, action: "super.bootstrap-cli", createdAt: now });

console.log(`\n✔ Super admin created: ${name} <${email}>`);
console.log("  Sign in on the website with Ctrl+Shift+K.\n  Delete or ignore this script on servers — it is never deployed.\n");
await mongoose.disconnect();
process.exit(0);
