import dayjs from "dayjs";

/**
 * Chuyển Dayjs object hoặc chuỗi về Date
 * @param {dayjs.Dayjs | string | null} dayjsObj
 * @returns {Date | null}
 */
export const parseDayjsToDate = (dayjsObj) => {
  if (!dayjsObj) return null;
  if (dayjs.isDayjs(dayjsObj)) return dayjsObj.toDate();
  const d = dayjs(dayjsObj, "DD/MM/YYYY", true);
  return d.isValid() ? d.toDate() : null;
};

/**
 * Chuyển giá trị về dayjs object hoặc null
 * @param {any} value
 * @returns {dayjs.Dayjs | null}
 */
export const toDayjsOrNull = (value) => {
  if (!value) return null;
  if (dayjs.isDayjs(value)) return value;
  if (value._seconds) return dayjs.unix(value._seconds);
  const parsed = dayjs(value, "DD/MM/YYYY", true);
  if (parsed.isValid()) return parsed;
  const parsed2 = dayjs(value);
  return parsed2.isValid() ? parsed2 : null;
};

/**
 * Chuẩn hóa giá trị ngày về định dạng "DD/MM/YYYY"
 * @param {any} ts
 * @returns {string | null}
 */
export const normalizeDate = (ts) => {
  if (!ts) return null;
  if (ts._seconds) return dayjs.unix(ts._seconds).format("DD/MM/YYYY");
  if (dayjs.isDayjs(ts)) return ts.format("DD/MM/YYYY");
  const d = dayjs(ts);
  return d.isValid() ? d.format("DD/MM/YYYY") : null;
};
