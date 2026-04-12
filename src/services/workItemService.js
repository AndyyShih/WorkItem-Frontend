const STORAGE_KEY = "work-item-db";

const seedData = {
  items: [
    {
      id: 1,
      title: "完成需求拆解",
      description: "釐清 My Work Item 功能與操作流程",
      createdAt: "2026-04-10T08:00:00.000Z",
      updatedAt: "2026-04-10T08:00:00.000Z"
    },
    {
      id: 2,
      title: "建立前台頁面",
      description: "實作 Work Item List 與 Detail 視圖",
      createdAt: "2026-04-11T03:30:00.000Z",
      updatedAt: "2026-04-11T03:30:00.000Z"
    },
    {
      id: 3,
      title: "串接狀態更新 API",
      description: "完成確認、撤銷與錯誤回饋",
      createdAt: "2026-04-12T02:45:00.000Z",
      updatedAt: "2026-04-12T02:45:00.000Z"
    }
  ],
  userStatus: {
    admin: {},
    user1: {},
    user2: {}
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readDb() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return clone(seedData);
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.items) || typeof parsed.userStatus !== "object") {
      return clone(seedData);
    }
    return parsed;
  } catch {
    return clone(seedData);
  }
}

function writeDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function toViewItem(item, statusMap) {
  return {
    ...item,
    status: statusMap[item.id] === "confirmed" ? "confirmed" : "pending"
  };
}

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), 120));
}

export async function listWorkItemsByUser(userId) {
  const db = readDb();
  const statusMap = db.userStatus[userId] || {};
  const result = db.items
    .map((item) => toViewItem(item, statusMap))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return delay(result);
}

export async function getWorkItemDetailByUser(userId, id) {
  const db = readDb();
  const statusMap = db.userStatus[userId] || {};
  const target = db.items.find((item) => item.id === Number(id));
  if (!target) {
    return delay(null);
  }
  return delay(toViewItem(target, statusMap));
}

export async function confirmWorkItems(userId, ids) {
  const db = readDb();
  const nextMap = { ...(db.userStatus[userId] || {}) };
  ids.forEach((id) => {
    nextMap[Number(id)] = "confirmed";
  });
  db.userStatus[userId] = nextMap;
  writeDb(db);
  return listWorkItemsByUser(userId);
}

export async function undoWorkItem(userId, id) {
  const db = readDb();
  const targetId = Number(id);
  const nextMap = { ...(db.userStatus[userId] || {}) };
  if (nextMap[targetId] !== "confirmed") {
    throw new Error("此項目尚未確認，無法撤銷");
  }
  delete nextMap[targetId];
  db.userStatus[userId] = nextMap;
  writeDb(db);
  return listWorkItemsByUser(userId);
}

export async function listAdminItems() {
  const db = readDb();
  const result = [...db.items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return delay(result);
}

export async function createAdminItem(payload) {
  const db = readDb();
  const now = new Date().toISOString();
  const nextId = db.items.length ? Math.max(...db.items.map((item) => item.id)) + 1 : 1;
  db.items.push({
    id: nextId,
    title: payload.title.trim(),
    description: payload.description?.trim() || "",
    createdAt: now,
    updatedAt: now
  });
  writeDb(db);
  return delay(true);
}

export async function updateAdminItem(id, payload) {
  const db = readDb();
  const targetId = Number(id);
  let found = false;
  db.items = db.items.map((item) => {
    if (item.id !== targetId) {
      return item;
    }
    found = true;
    return {
      ...item,
      title: payload.title.trim(),
      description: payload.description?.trim() || "",
      updatedAt: new Date().toISOString()
    };
  });
  if (!found) {
    throw new Error("找不到該筆 Work Item");
  }
  writeDb(db);
  return delay(true);
}

export async function deleteAdminItem(id) {
  const db = readDb();
  const targetId = Number(id);
  const prevLength = db.items.length;
  db.items = db.items.filter((item) => item.id !== targetId);
  if (db.items.length === prevLength) {
    throw new Error("找不到該筆 Work Item");
  }

  Object.keys(db.userStatus).forEach((userId) => {
    const statusMap = { ...(db.userStatus[userId] || {}) };
    delete statusMap[targetId];
    db.userStatus[userId] = statusMap;
  });
  writeDb(db);
  return delay(true);
}
