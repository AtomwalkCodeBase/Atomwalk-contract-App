const MONTH_SHORT_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


export const formatToDDMMYYYY = (dateValue) => {
    if (!dateValue) return ""

    if (dateValue instanceof Date) {
        const dd = String(dateValue.getDate()).padStart(2, "0")
        const mm = String(dateValue.getMonth() + 1).padStart(2, "0")
        const yyyy = dateValue.getFullYear()
        return `${dd}-${mm}-${yyyy}`
    }

    if (typeof dateValue === "string" && dateValue.includes("-")) {
        const [year, month, day] = dateValue.split("-")
        return `${day}-${month}-${year}`
    }

    return ""
}

export const getTodayApiDateStr = () => {
    const d = new Date();
    return formatToApiDate(d);
};

export const formatToApiDate = (d) => {
    if (!(d instanceof Date)) return null;
    const dd = String(d.getDate()).padStart(2, "0");
    const mon = MONTH_SHORT_NAMES[d.getMonth()];
    const yyyy = d.getFullYear();
    return `${dd}-${mon}-${yyyy}`;
};

export const getCurrentDateTimeDefaults = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  const yyyy = now.getFullYear()
  const mm = pad(now.getMonth() + 1)
  const dd = pad(now.getDate())
  const todayISO = `${yyyy}-${mm}-${dd}`
  const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  const dayLogKey = `${dd}-${MONTH_SHORT_NAMES[now.getMonth()]}-${yyyy}`
  const apiDate = formatToDDMMYYYY(todayISO)

  return { todayISO, dayLogKey, apiDate, currentTime }
}

  export const DateForApiFormate = (value, returnComparable = false) => {
    if (!value) return "";
    let d = value;
    // If value is a string → normalize it
    if (typeof value === "string") {
        // Replace "/" with "-" to standardize
        value = value.replace(/\//g, "-");

        const monthNameMap = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };

        // Split on "-" (after normalization)
        const parts = value.split("-");

        if (parts.length === 3) {
            let [a, b, c] = parts;

            // Case: "02-Dec-2025"
            if (monthNameMap[b]) {
                d = new Date(Number(c), monthNameMap[b], Number(a));
            }
            // Case: "2025-12-02" (YYYY-MM-DD)
            else if (a.length === 4) {
                d = new Date(Number(a), Number(b) - 1, Number(c));
            }
            // Case: "02-12-2025" (DD-MM-YYYY)
            else {
                d = new Date(Number(c), Number(b) - 1, Number(a));
            }
        } else {
            // Fallback: try JS parser
            d = new Date(value);
        }
    }
    if (!(d instanceof Date) || isNaN(d)) return "";

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    if (returnComparable) {
        return `${yyyy}-${mm}-${dd}`;
    }

    return `${dd}-${mm}-${yyyy}`;
};