const GET_LIST_WORK_ITEM_URL = "http://localhost:5284/api/WorkItem/GetListWorkItem";
const GET_DETAIL_WORK_ITEM_URL = "http://localhost:5284/api/WorkItem/GetWorkItemDetail";
const BATCH_CONFIRM_WORK_ITEM_URL = "http://localhost:5284/api/WorkItem/BatchWorkItemConfirm";
const BATCH_CANCEL_WORK_ITEM_URL = "http://localhost:5284/api/WorkItem/BatchWorkItemCancel";
const CREATE_WORK_ITEM_URL = "http://localhost:5284/api/WorkItem/CreateWorkItem";
const UPDATE_WORK_ITEM_URL = "http://localhost:5284/api/WorkItem/UpdateWorkItem";
const DELETE_WORK_ITEM_URL = "http://localhost:5284/api/WorkItem/DeleteWorkItem";

function requireToken(token) {
  if (!token) {
    throw new Error("尚未登入或 token 遺失");
  }
}

async function parseApiResponse(response, defaultError) {
  if (!response.ok) {
    throw new Error(defaultError);
  }

  const payload = await response.json();
  if (!payload?.isSuccess) {
    const message =
      payload?.message ||
      (Array.isArray(payload?.errors) && payload.errors.length > 0
        ? payload.errors.join(", ")
        : defaultError);
    throw new Error(message);
  }

  return payload;
}

function normalizeStatus(rawStatus) {
  if (typeof rawStatus === "boolean") {
    return rawStatus ? "confirmed" : "pending";
  }

  if (typeof rawStatus === "number") {
    return rawStatus === 1 ? "confirmed" : "pending";
  }

  const normalized = String(rawStatus || "")
    .trim()
    .toLowerCase();

  if (
    normalized.includes("confirm") ||
    normalized.includes("completed") ||
    normalized.includes("done") ||
    normalized.includes("已確認") ||
    normalized.includes("已完成")
  ) {
    return "confirmed";
  }

  return "pending";
}

function normalizeItem(raw) {
  const createdAt = raw.createdAt ?? raw.createTime ?? raw.createdOn ?? null;
  const updatedAt = raw.updatedAt ?? raw.updateTime ?? raw.updatedOn ?? null;
  const statusSource =
    raw.status ??
    raw.state ??
    raw.statusText ??
    raw.statusName ??
    raw.workItemStatus ??
    raw.workitemStatus ??
    raw.isConfirmed ??
    raw.isConfirm ??
    raw.confirmed;

  return {
    id: Number(raw.id ?? raw.workItemId ?? raw.workitemId ?? raw.itemId),
    title: String(raw.title ?? raw.name ?? raw.subject ?? ""),
    description: String(raw.description ?? raw.content ?? ""),
    status: normalizeStatus(statusSource),
    createdAt,
    updatedAt
  };
}

function extractListData(payload) {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items;
  }
  if (Array.isArray(payload?.data?.list)) {
    return payload.data.list;
  }
  if (Array.isArray(payload?.data?.workItems)) {
    return payload.data.workItems;
  }
  return [];
}

async function listWorkItemsByApi(token) {
  requireToken(token);

  const response = await fetch(GET_LIST_WORK_ITEM_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const payload = await parseApiResponse(response, "取得工作清單失敗");
  return extractListData(payload)
    .map(normalizeItem)
    .filter((item) => Number.isFinite(item.id) && item.id > 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function getWorkItemDetailByApi(id, token) {
  requireToken(token);

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

  const payload = await parseApiResponse(response, "取得工作詳情失敗");
  if (!payload?.data) {
    return null;
  }

  return normalizeItem(payload.data);
}

async function postBatchAction(url, ids, token) {
  requireToken(token);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      workItemIds: ids.map((id) => Number(id))
    })
  });

  await parseApiResponse(response, "批次更新狀態失敗");
}

export async function listWorkItemsByUser(_userId, token) {
  return listWorkItemsByApi(token);
}

export async function getWorkItemDetailByUser(_userId, id, token) {
  return getWorkItemDetailByApi(id, token);
}

export async function confirmWorkItems(_userId, ids, token) {
  await postBatchAction(BATCH_CONFIRM_WORK_ITEM_URL, ids, token);
  return listWorkItemsByApi(token);
}

export async function undoWorkItem(_userId, id, token) {
  await postBatchAction(BATCH_CANCEL_WORK_ITEM_URL, [id], token);
  return listWorkItemsByApi(token);
}

export async function listAdminItems() {
  throw new Error("Admin 獨立頁面已停用");
}

export async function createAdminItem(payload, token) {
  requireToken(token);
  const response = await fetch(CREATE_WORK_ITEM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: payload.title,
      description: payload.description || ""
    })
  });
  await parseApiResponse(response, "新增工作項目失敗");
  return true;
}

export async function updateAdminItem(id, payload, token) {
  requireToken(token);
  const response = await fetch(UPDATE_WORK_ITEM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      id: Number(id),
      title: payload.title,
      description: payload.description || ""
    })
  });
  await parseApiResponse(response, "修改工作項目失敗");
  return true;
}

export async function deleteAdminItem(id, token) {
  requireToken(token);
  const response = await fetch(DELETE_WORK_ITEM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      id: Number(id)
    })
  });
  await parseApiResponse(response, "刪除工作項目失敗");
  return true;
}
