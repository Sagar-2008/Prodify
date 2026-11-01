import assert from "node:assert/strict";
import { createServer } from "node:http";
import { deflateSync } from "node:zlib";
import { randomUUID } from "node:crypto";
import test from "node:test";
import bcrypt from "bcrypt";
import { app } from "../src/app.js";
import { db } from "../src/config/db.js";

function pngChunk(name, data) {
  const type = Buffer.from(name);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([type, data]);
  let crc = 0xffffffff;
  for (const byte of crcInput) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, crcInput, checksum]);
}

function onePixelPng() {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(1, 0);
  header.writeUInt32BE(1, 4);
  header[8] = 8;
  header[9] = 6;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(Buffer.from([0, 40, 140, 220, 255]))),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

test("authenticated app API integration", async (t) => {
  const suffix = randomUUID();
  const password = `Suite-${randomUUID()}-pass!`;
  const passwordHash = await bcrypt.hash(password, 8);
  let ownerId;
  let otherId;
  let server;
  let baseUrl;
  let ownerToken;
  let otherToken;

  const request = async (path, { token = ownerToken, method = "GET", body } = {}) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : Buffer.from(await response.arrayBuffer());
    return { status: response.status, data, headers: response.headers };
  };

  try {
    const [owner] = await db.query(
      "INSERT INTO users (email, password, is_verified) VALUES (?, ?, 1)",
      [`suite-owner-${suffix}@example.invalid`, passwordHash],
    );
    ownerId = owner.insertId;
    const [other] = await db.query(
      "INSERT INTO users (email, password, is_verified) VALUES (?, ?, 1)",
      [`suite-other-${suffix}@example.invalid`, passwordHash],
    );
    otherId = other.insertId;

    server = createServer(app);
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    const ownerLogin = await request("/auth/login", {
      token: null,
      method: "POST",
      body: { email: `suite-owner-${suffix}@example.invalid`, password },
    });
    const otherLogin = await request("/auth/login", {
      token: null,
      method: "POST",
      body: { email: `suite-other-${suffix}@example.invalid`, password },
    });
    assert.equal(ownerLogin.status, 200);
    assert.equal(otherLogin.status, 200);
    ownerToken = ownerLogin.data.token;
    otherToken = otherLogin.data.token;

    await t.test("authentication and isolated account defaults", async () => {
      assert.equal((await request("/auth/register", { token: null, method: "POST", body: { email: "", password: "" } })).status, 400);
      assert.equal((await request("/auth/register", { token: null, method: "POST", body: { email: `suite-owner-${suffix}@example.invalid`, password } })).status, 409);
      assert.equal((await request("/auth/verify-otp", { token: null, method: "POST", body: { email: `suite-owner-${suffix}@example.invalid`, otp: "000000" } })).status, 401);
      assert.equal((await request("/auth/resend-otp", { token: null, method: "POST", body: { email: `suite-owner-${suffix}@example.invalid` } })).status, 400);
      const badLogin = await request("/auth/login", {
        token: null,
        method: "POST",
        body: { email: `suite-owner-${suffix}@example.invalid`, password: "wrong-password" },
      });
      assert.equal(badLogin.status, 401);
      assert.equal((await request("/auth/login", { token: null, method: "POST", body: { email: "missing@example.invalid", password } })).status, 404);
      assert.equal((await request("/user/me", { token: null })).status, 401);
      assert.equal((await request("/user/me")).data.userId, ownerId);
      assert.equal((await request("/productivity", { token: null })).status, 401);

      const initial = await request("/productivity");
      assert.equal(initial.status, 200);
      assert.equal(initial.data.userId, ownerId);
      assert.equal(initial.data.power.powerLevel, 1);
      assert.equal(initial.data.power.rank, "Earthling");
      assert.equal(initial.data.profile.theme, "capsule");
      assert.equal(initial.data.profile.hasPoster, false);

      const other = await request("/productivity", { token: otherToken });
      assert.equal(other.status, 200);
      assert.deepEqual(other.data.quests, []);
      assert.deepEqual(other.data.categories, { quest: [], goal: [], training: [] });
    });

    await t.test("palette and favorite-character artwork profile CRUD", async () => {
      assert.equal((await request("/productivity/profile/theme", { method: "PATCH", body: { theme: "unknown" } })).status, 400);
      for (const theme of ["capsule", "solar", "namek", "kai", "rose"]) {
        assert.equal((await request("/productivity/profile/theme", { method: "PATCH", body: { theme } })).status, 200);
        assert.equal((await request("/productivity/profile")).data.theme, theme);
      }
      assert.equal((await request("/productivity")).data.profile.theme, "rose");
      assert.equal((await request("/productivity/profile", { token: otherToken })).data.theme, "capsule");

      const image = onePixelPng();
      const upload = await request("/productivity/profile/artwork", {
        method: "PUT",
        body: { dataUrl: `data:image/png;base64,${image.toString("base64")}`, fileName: "suite-character.png" },
      });
      assert.equal(upload.status, 200);
      const profile = await request("/productivity/profile");
      assert.equal(profile.data.hasPoster, true);
      assert.equal(profile.data.posterName, "suite-character.png");

      const replacement = await request("/productivity/profile/artwork", {
        method: "PUT",
        body: { dataUrl: `data:image/png;base64,${image.toString("base64")}`, fileName: "replacement-character.png" },
      });
      assert.equal(replacement.status, 200);
      assert.equal((await request("/productivity/profile")).data.posterName, "replacement-character.png");

      const artwork = await request("/productivity/profile/artwork");
      assert.equal(artwork.status, 200);
      assert.match(artwork.headers.get("content-type"), /image\/png/);
      assert.deepEqual(artwork.data, image);
      assert.equal((await request("/productivity/profile/artwork", { token: otherToken })).status, 404);

      const wrongType = await request("/productivity/profile/artwork", {
        method: "PUT",
        body: { dataUrl: "data:image/svg+xml;base64,PHN2Zz4=", fileName: "bad.svg" },
      });
      assert.equal(wrongType.status, 400);
      const spoofedType = await request("/productivity/profile/artwork", {
        method: "PUT",
        body: { dataUrl: "data:image/png;base64,SGVsbG8=", fileName: "not-a-png.png" },
      });
      assert.equal(spoofedType.status, 400);
      const oversized = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(4 * 1024 * 1024 - 2)]);
      const tooLarge = await request("/productivity/profile/artwork", {
        method: "PUT",
        body: { dataUrl: `data:image/jpeg;base64,${oversized.toString("base64")}`, fileName: "too-large.jpg" },
      });
      assert.equal(tooLarge.status, 413);

      assert.equal((await request("/productivity/profile/artwork", { method: "DELETE" })).status, 200);
      assert.equal((await request("/productivity/profile/artwork")).status, 404);
    });

    await t.test("personalized power curve and quest completion", async () => {
      const profileSettings = {
        xpPerLevel: 100,
        xpMultiplier: 1,
        focusXp: 35,
        trainingXpPerHour: 60,
        solvedBonus: 10,
        rankNames: ["Earthling", "Saiyan", "Super Saiyan", "Ascended Saiyan", "Super Saiyan 2", "Super Saiyan 3", "Super Saiyan God", "Ultra Instinct"],
      };
      assert.equal((await request("/productivity/settings", { method: "PATCH", body: { ...profileSettings, xpPerLevel: 2 } })).status, 400);
      assert.equal((await request("/productivity/settings", { method: "PATCH", body: profileSettings })).status, 200);

      const dueDate = new Date().toISOString().slice(0, 10);
      const invalidQuest = await request("/productivity/quests", { method: "POST", body: { title: "Invalid", category: "Study", xp: -1, dueDate } });
      assert.equal(invalidQuest.status, 400);
      const created = await request("/productivity/quests", {
        method: "POST",
        body: { clientId: `suite-${suffix}`, title: "Reach Saiyan", category: "Study", xp: 1000, dueDate },
      });
      assert.equal(created.status, 201);
      const questId = created.data.id;
      assert.equal((await request(`/productivity/quests/${questId}`, { token: otherToken, method: "PATCH", body: { completed: true } })).status, 404);

      assert.equal((await request(`/productivity/quests/${questId}`, { method: "PATCH", body: { completed: true } })).status, 200);
      const powerUp = await request("/productivity");
      assert.equal(powerUp.data.power.totalXp, 1000);
      assert.equal(powerUp.data.power.powerLevel, 10);
      assert.equal(powerUp.data.power.rank, "Saiyan");
      assert.equal(powerUp.data.power.nextRank, "Super Saiyan");
      assert.equal(powerUp.data.power.nextRankLevel, 21);
      assert.equal(powerUp.data.power.nextRankXp, 2000);
      assert.equal(powerUp.data.power.xpToNextRank, 1000);

      assert.equal((await request(`/productivity/quests/${questId}`, { method: "PATCH", body: { completed: false } })).status, 200);
      assert.equal((await request("/productivity")).data.power.rank, "Earthling");
      assert.equal((await request(`/productivity/quests/${questId}`, { method: "DELETE" })).status, 200);
    });

    await t.test("goals, milestones, editing, and account isolation", async () => {
      const created = await request("/productivity/goals", {
        method: "POST",
        body: { clientId: `goal-${suffix}`, title: "Build a portfolio", area: "Career", kind: "Project", target: 3 },
      });
      assert.equal(created.status, 201);
      const goalId = created.data.id;
      assert.equal((await request(`/productivity/goals/${goalId}`, { method: "PATCH", body: { progressDelta: 1 } })).data.progress, 1);
      assert.equal((await request(`/productivity/goals/${goalId}`, { method: "PATCH", body: { title: "Ship my portfolio", area: "Build", kind: "Goal", target: 2, dueDate: "" } })).status, 200);
      const loaded = await request("/productivity");
      assert.equal(loaded.data.goals[0].title, "Ship my portfolio");
      assert.equal(loaded.data.goals[0].area, "Build");
      assert.equal(loaded.data.goals[0].progress, 1);
      assert.equal((await request(`/productivity/goals/${goalId}`, { token: otherToken, method: "DELETE" })).status, 404);
      assert.equal((await request(`/productivity/goals/${goalId}`, { method: "DELETE" })).status, 200);
    });

    await t.test("custom categories and idempotent local-data import", async () => {
      assert.equal((await request("/productivity/categories", { method: "POST", body: { module: "unknown", name: "Music theory" } })).status, 400);
      const savedCategories = [];
      for (const module of ["quest", "goal", "training"]) {
        const category = await request("/productivity/categories", { method: "POST", body: { module, name: "Personal suite category" } });
        assert.equal(category.status, 201);
        assert.equal((await request("/productivity/categories", { method: "POST", body: { module, name: "Personal suite category" } })).data.id, category.data.id);
        savedCategories.push(category.data);
      }
      const categorySnapshot = (await request("/productivity")).data.categories;
      for (const module of ["quest", "goal", "training"]) {
        assert.equal(categorySnapshot[module][0].name, "Personal suite category");
      }
      assert.deepEqual((await request("/productivity", { token: otherToken })).data.categories, { quest: [], goal: [], training: [] });
      for (const category of savedCategories) {
        assert.equal((await request(`/productivity/categories/${category.id}`, { method: "DELETE" })).status, 200);
      }

      const batch = {
        quests: [{ id: `import-${suffix}`, title: "Imported quest", category: "Personal", xp: 10, dueDate: new Date().toISOString().slice(0, 10) }],
        goals: [{ id: `import-goal-${suffix}`, title: "Imported goal", area: "Personal", target: 2, progress: 1 }],
        training: [{ id: `import-training-${suffix}`, title: "Imported session", type: "Reading", minutes: 20, solved: false, date: new Date().toISOString().slice(0, 10) }],
      };
      assert.equal((await request("/productivity/import-local", { method: "POST", body: batch })).status, 200);
      assert.equal((await request("/productivity/import-local", { method: "POST", body: batch })).status, 200);
      const imported = await request("/productivity");
      assert.equal(imported.data.quests.filter((item) => item.title === "Imported quest").length, 1);
      assert.equal(imported.data.goals.filter((item) => item.title === "Imported goal").length, 1);
      assert.equal(imported.data.training.filter((item) => item.title === "Imported session").length, 1);
    });

    await t.test("training CRUD and XP calculation", async () => {
      const created = await request("/productivity/training", {
        method: "POST",
        body: { clientId: `training-${suffix}`, title: "Study music theory", category: "Music theory", minutes: 60, solved: false, date: new Date().toISOString().slice(0, 10) },
      });
      assert.equal(created.status, 201);
      const id = created.data.id;
      assert.equal((await request(`/productivity/training/${id}`, { method: "PATCH", body: { solved: true } })).status, 200);
      const data = await request("/productivity");
      assert.equal(data.data.training.find((entry) => entry.id === id).solved, true);
      assert.equal(data.data.power.solvedCount, 1);
      assert.equal((await request(`/productivity/training/${id}`, { method: "DELETE" })).status, 200);
    });

    await t.test("habits, calendar views, analytics, and ownership", async () => {
      assert.equal((await request("/habits", { method: "POST", body: { title: "   " } })).status, 400);
      const habit = await request("/habits", { method: "POST", body: { title: "Suite habit" } });
      assert.equal(habit.status, 201);
      const today = new Date().toISOString().slice(0, 10);
      assert.equal((await request(`/habits/${habit.data.id}/toggle`, { method: "POST", body: { date: today } })).status, 200);
      const habits = await request("/habits");
      assert.equal(habits.data.find((entry) => entry.id === habit.data.id).title, "Suite habit");
      assert.deepEqual((await request("/habits", { token: otherToken })).data, []);
      const habitsToday = await request("/habits/today");
      assert.equal(habitsToday.data.find((entry) => entry.habit_id === habit.data.id).completed, 1);
      const [year, month] = today.split("-");
      const monthView = await request(`/habits/month?year=${year}&month=${Number(month)}`);
      assert.ok(monthView.data.logs.some((entry) => entry.habit_id === habit.data.id && entry.log_date === today));
      const analytics = await request("/habits/analytics");
      assert.equal(Number(analytics.data.totalHabits), 1);
      assert.ok(Number(analytics.data.streak) >= 1);
      assert.equal((await request(`/habits/${habit.data.id}/toggle`, { token: otherToken, method: "POST", body: { date: today } })).status, 404);
      assert.equal((await request(`/habits/${habit.data.id}`, { token: otherToken, method: "DELETE" })).status, 404);
      assert.equal((await request("/habits")).data.length, 1);
      assert.equal((await request(`/habits/${habit.data.id}/toggle`, { method: "POST", body: { date: today } })).status, 200);
      assert.equal((await request("/habits/today")).data[0].completed, 0);
      assert.equal((await request(`/habits/${habit.data.id}`, { method: "DELETE" })).status, 200);
      assert.equal((await request("/habits")).data.length, 0);
    });

    await t.test("Pomodoro session recording, listing, stats, and ownership", async () => {
      assert.equal((await request("/pomodoro/session", { method: "POST", body: { taskName: "", duration: 0 } })).status, 400);
      assert.equal((await request("/pomodoro/session", { method: "POST", body: { taskName: "Suite focus", duration: 25 } })).status, 201);
      const sessions = await request("/pomodoro/sessions");
      assert.equal(sessions.data.data.length, 1);
      assert.equal(sessions.data.data[0].task_name, "Suite focus");
      assert.equal(Number(sessions.data.data[0].duration), 25);
      assert.equal((await request("/pomodoro/sessions", { token: otherToken })).data.data.length, 0);
      const stats = await request("/pomodoro/stats");
      assert.equal(Number(stats.data.data.total_sessions), 1);
      assert.equal(Number(stats.data.data.total_minutes), 25);
      assert.equal((await request("/productivity")).data.power.focusSessions, 1);
    });

    await t.test("journal create, update, month, stats, delete, and ownership", async () => {
      const today = new Date().toISOString().slice(0, 10);
      assert.equal((await request("/journal", { method: "POST", body: { entry_date: today, content: "   " } })).status, 400);
      const entry = await request("/journal", { method: "POST", body: { entry_date: today, title: "Suite journal", content: "First draft", mood: "focused" } });
      assert.equal(entry.status, 201);
      const edited = await request("/journal", { method: "POST", body: { entry_date: today, title: "Suite journal", content: "Updated draft", mood: "calm" } });
      assert.equal(edited.status, 200);
      assert.equal((await request(`/journal/${entry.data.id}`)).data.content, "Updated draft");
      assert.equal((await request(`/journal/${entry.data.id}`, { token: otherToken })).status, 404);
      const [year, month] = today.split("-");
      assert.equal((await request(`/journal/month?year=${year}&month=${Number(month)}`)).data.length, 1);
      assert.equal((await request("/journal")).data.length, 1);
      assert.equal(Number((await request("/journal/stats")).data.total_entries), 1);
      assert.equal((await request("/journal", { token: otherToken })).data.length, 0);
      assert.equal((await request(`/journal/${entry.data.id}`, { method: "DELETE" })).status, 200);
      assert.equal((await request("/journal")).data.length, 0);
    });
  } finally {
    if (ownerId) await db.query("DELETE FROM users WHERE id = ?", [ownerId]);
    if (otherId) await db.query("DELETE FROM users WHERE id = ?", [otherId]);
    if (server?.listening) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    await db.end();
  }
});
