export const STORAGE_TYPE_OPTIONS = [
  { label: "Dry", value: "DRY" },
  { label: "Cold", value: "COLD" },
  { label: "Frozen", value: "FROZEN" },
];

export const normalizeStorageType = (value) => {
  const normalized = String(value || "").trim().toUpperCase();

  return STORAGE_TYPE_OPTIONS.some((option) => option.value === normalized)
    ? normalized
    : undefined;
};

export const formatStorageType = (value) => {
  const normalized = normalizeStorageType(value);
  const option = STORAGE_TYPE_OPTIONS.find((item) => item.value === normalized);

  return option?.label || value || "-";
};
