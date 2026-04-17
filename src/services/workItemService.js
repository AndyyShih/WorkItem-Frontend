import { apiGet, apiPost } from "./apiClient";

function requireToken(token) {
  if (!token) {
    throw new Error("尚未登入或 token 遺失");
  }
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
  const payload = await apiGet("/api/WorkItem/GetListWorkItem", {
    token,
    fallbackError: "取得工作清單失敗"
  });

  return extractListData(payload)
    .map(normalizeItem)
    .filter((item) => Number.isFinite(item.id) && item.id > 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function getWorkItemDetailByApi(id, token) {
  requireToken(token);

  const payload = await apiPost(
    "/api/WorkItem/GetWorkItemDetail",
    {
      id: Number(id)
    },
    {
      token,
      fallbackError: "取得工作詳情失敗"
    }
  );

  if (!payload?.data) {
    return null;
  }

  return normalizeItem(payload.data);
}

async function postBatchAction(path, ids, token) {
  requireToken(token);
  await apiPost(
    path,
    {
      workItemIds: ids.map((id) => Number(id))
    },
    {
      token,
      fallbackError: "批次更新狀態失敗"
    }
  );
}

export async function listWorkItemsByUser(_userId, token) {
  return listWorkItemsByApi(token);
}

export async function getWorkItemDetailByUser(_userId, id, token) {
  return getWorkItemDetailByApi(id, token);
}

export async function confirmWorkItems(_userId, ids, token) {
  await postBatchAction("/api/WorkItem/BatchWorkItemConfirm", ids, token);
  return listWorkItemsByApi(token);
}

export async function undoWorkItem(_userId, id, token) {
  await postBatchAction("/api/WorkItem/BatchWorkItemCancel", [id], token);
  return listWorkItemsByApi(token);
}

export async function listAdminItems() {
  throw new Error("Admin 獨立頁面已停用");
}

export async function createAdminItem(payload, token) {
  requireToken(token);
  await apiPost(
    "/api/WorkItem/CreateWorkItem",
    {
      title: payload.title,
      description: payload.description || ""
    },
    {
      token,
      fallbackError: "新增工作項目失敗"
    }
  );
  return true;
}

export async function updateAdminItem(id, payload, token) {
  requireToken(token);
  await apiPost(
    "/api/WorkItem/UpdateWorkItem",
    {
      id: Number(id),
      title: payload.title,
      description: payload.description || ""
    },
    {
      token,
      fallbackError: "修改工作項目失敗"
    }
  );
  return true;
}

export async function deleteAdminItem(id, token) {
  requireToken(token);
  await apiPost(
    "/api/WorkItem/DeleteWorkItem",
    {
      id: Number(id)
    },
    {
      token,
      fallbackError: "刪除工作項目失敗"
    }
  );
  return true;
}
