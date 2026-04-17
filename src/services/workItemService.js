const STORAGE_KEY = "work-item-db";
const GET_LIST_WORK_ITEM_URL = "http://localhost:5284/api/WorkItem/GetListWorkItem";
const GET_DETAIL_WORK_ITEM_URL = "http://localhost:5284/api/WorkItem/GetDetail";

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

function normalizeStatus(rawStatus) {
  const normalized = String(rawStatus || "").toLowerCase();
  if (normalized.includes("confirm")) {
    return "confirmed";
  }
  return "pending";
}

function normalizeItem(raw) {
  const createdAt = raw.createdAt ?? raw.createTime ?? raw.createdOn ?? null;
  const updatedAt = raw.updatedAt ?? raw.updateTime ?? raw.updatedOn ?? null;
  return {
    id: Number(raw.id ?? raw.workItemId ?? raw.workitemId ?? raw.itemId),
    title: String(raw.title ?? raw.name ?? raw.subject ?? ""),
    description: String(raw.description ?? raw.content ?? ""),
    status: normalizeStatus(raw.status ?? raw.state),
    createdAt,
    updatedAt
  };
}

async function listWorkItemsByApi(token) {
  const response = await fetch(GET_LIST_WORK_ITEM_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error("取得工作清單失敗");
  }

  const payload = await response.json();
  if (!payload?.isSuccess) {
    const message =
      payload?.message ||
      (Array.isArray(payload?.errors) && payload.errors.length > 0
        ? payload.errors.join(", ")
        : "取得工作清單失敗");
    throw new Error(message);
  }

  if (!Array.isArray(payload?.data)) {
    return [];
  }

  return payload.data
    .map(normalizeItem)
    .filter((item) => Number.isFinite(item.id) && item.id > 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function listWorkItemsByUser(userId, token) {
  if (token) {
    try {
      return await listWorkItemsByApi(token);
    } catch {
      // fallback to local mock while other APIs are not fully wired
    }
  }

  const db = readDb();
  const statusMap = db.userStatus[userId] || {};
  const result = db.items
    .map((item) => toViewItem(item, statusMap))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return delay(result);
}

async function getWorkItemDetailByApi(id, token) {
  const response = await fetch(GET_DETAIL_WORK_ITEM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      id: Number(id)
    })
  });
  if (!response.ok) {
    throw new Error("取得工作詳情失敗");
  }

  const payload = await response.json();
  if (!payload?.isSuccess) {
    const message =
      payload?.message ||
      (Array.isArray(payload?.errors) && payload.errors.length > 0
        ? payload.errors.join(", ")
        : "取得工作詳情失敗");
    throw new Error(message);
  }

  if (!payload?.data) {
    return null;
  }
  return normalizeItem(payload.data);
}

export async function getWorkItemDetailByUser(userId, id, token) {
  if (token) {
    try {
      return await getWorkItemDetailByApi(id, token);
    } catch {
      // fallback to local mock while other APIs are not fully wired
    }
  }

  const targetId = Number(id);
  const db = readDb();
  const statusMap = db.userStatus[userId] || {};
  const target = db.items.find((item) => item.id === targetId);
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
