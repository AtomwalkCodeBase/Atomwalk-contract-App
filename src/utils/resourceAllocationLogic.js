// Flatten all actualDraftsByDate entries into single-day rows, then merge

import { DateForApiFormate, formatToApiDate, mergeAdjacentRows } from "./utils";

// contiguous same-employee days into ranges (reuses your existing mergeAdjacentRows).
const toLocalDateOnly = (value) => {
    if (!value) return null;

    if (value instanceof Date) {
        return new Date(
            value.getFullYear(),
            value.getMonth(),
            value.getDate()
        );
    }
}

export const buildActualPayloadsForSubmit = (actualDraftsByDate, resourceList) => {
    // 1. Flatten drafts -> one row per emp per day
    const draftRows = [];
    Object.entries(actualDraftsByDate).forEach(([dStr, draft]) => {
        (draft.rows || []).forEach((row) => {
            draftRows.push({
                id: row.resource_id ?? null, // present only if row came from an existing API actual
                emp_id: row.emp_id,
                emp_type: row.emp_type,
                remarks: row.remarks || "",
                contract_rate: Number(row.contract_rate) || 0,
                start_date: DateForApiFormate(dStr),
                end_date: DateForApiFormate(dStr),
                rowKey: row.rowKey,
            });
        });
    });

    // 2. Flatten original API actual rows -> one row per emp per day, to compare against
    const originalRows = [];
    resourceList.forEach((r) => {
        const s = toLocalDateOnly(r.s_date);
        const e = toLocalDateOnly(r.e_date);
        if (!s || !e) return;
        const cur = new Date(s);
        while (cur <= e) {
            originalRows.push({
                id: r.id,
                emp_id: r.emp_id,
                emp_type: r.emp_type,
                remarks: r.remarks || "",
                contract_rate: Number(r.contract_rate) || 0,
                start_date: formatToApiDate(cur),
                end_date: formatToApiDate(cur),
            });
            cur.setDate(cur.getDate() + 1);
        }
    });

    // 3. Merge contiguous same-employee days into ranges on both sides
    const mergedDraft = mergeAdjacentRows(draftRows);
    const mergedOriginal = mergeAdjacentRows(originalRows);

    // 4. Diff merged ranges against original merged ranges (id-based, like buildPayloads)
    const originalById = {};
    mergedOriginal.forEach((r) => { originalById[r.id] = r; });

    const addPayload = [];
    const updatePayload = [];
    const unchangedPayload = [];
    const seenIds = new Set();

    mergedDraft.forEach((row) => {
        const base = {
            emp_id: row.emp_id,
            emp_type: row.emp_type,
            start_date: DateForApiFormate(row.start_date),
            end_date: DateForApiFormate(row.end_date),
            remarks: row.remarks || "",
            contract_rate: row.contract_rate || 0,
        };

        if (row.id == null) {
            addPayload.push(base);
            return;
        }

        seenIds.add(row.id);
        const original = originalById[row.id];
        if (!original) {
            addPayload.push(base); // id existed but no matching original range found -> treat as new
            return;
        }

        const changed =
            row.start_date !== original.start_date ||
            row.end_date !== original.end_date ||
            row.emp_type !== original.emp_type ||
            (row.remarks || "") !== (original.remarks || "") ||
            String(row.contract_rate ?? "") !== String(original.contract_rate ?? "");

        if (changed) {
            updatePayload.push({ ...base, id: row.id, is_updated: true });
        }else {
            unchangedPayload.push({ id: row.id, emp_id: row.emp_id, emp_type: row.emp_type });
        }
    });

    const deletePayload = mergedOriginal
        .filter((o) => !seenIds.has(o.id))
        .map((o) => ({ id: o.id, is_deleted: true }));

    return { addPayload, updatePayload, deletePayload, unchangedPayload };
};