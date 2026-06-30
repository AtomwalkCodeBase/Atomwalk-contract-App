import { useMemo } from "react";

const getNestedValue = (obj, path) => {
    if (!obj || !path) return [];

    const parts = path.split(".");
    
    const extract = (current, index) => {
        if (current == null) return [];

        if (index >= parts.length) {
            return [current];
        }

        let key = parts[index];

        // Handle array notation: po_items[]
        if (key.includes("[]")) {
            key = key.replace("[]", "");
            const arr = current[key];
            if (!Array.isArray(arr)) return [];
            return arr.flatMap((item) => extract(item, index + 1));
        }

        return extract(current[key], index + 1);
    };

    return extract(obj, 0);
};

const matchValue = (value, search) => {
    if (value == null) return false;

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return String(value).toLowerCase().includes(search.toLowerCase());
    }

    if (Array.isArray(value)) {
        return value.some((v) => matchValue(v, search));
    }

    if (typeof value === "object") {
        return Object.values(value).some((v) => matchValue(v, search));
    }

    return false;
};

const parseDateValue = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value !== "string") return null;

    const trimmed = value.trim();
    const isoDate = new Date(trimmed);
    if (!Number.isNaN(isoDate.getTime())) {
        return isoDate;
    }

    const parts = trimmed.split(/[-/]/).map((part) => part.trim());
    if (parts.length === 3) {
        const [first, second, third] = parts;

        const monthNames = {
            jan: 0,
            feb: 1,
            mar: 2,
            apr: 3,
            may: 4,
            jun: 5,
            jul: 6,
            aug: 7,
            sep: 8,
            oct: 9,
            nov: 10,
            dec: 11,
        };

        const yearFromFirst = /^[0-9]{4}$/.test(first);
        const yearFromThird = /^[0-9]{4}$/.test(third);
        const monthName = second.toLowerCase();

        if (yearFromFirst && /^[0-9]{1,2}$/.test(second) && /^[0-9]{1,2}$/.test(third)) {
            const date = new Date(Number(first), Number(second) - 1, Number(third));
            return Number.isNaN(date.getTime()) ? null : date;
        }

        if (yearFromThird && /^[0-9]{1,2}$/.test(first) && /^[0-9]{1,2}$/.test(second)) {
            const date = new Date(Number(third), Number(second) - 1, Number(first));
            return Number.isNaN(date.getTime()) ? null : date;
        }

        if (yearFromThird && monthNames[monthName] != null && /^[0-9]{1,2}$/.test(first)) {
            const date = new Date(Number(third), monthNames[monthName], Number(first));
            return Number.isNaN(date.getTime()) ? null : date;
        }
    }

    return null;
};

export const useFilter = ({ data = [], fields = [], search = "", extraFilters = {} }) => {
    return useMemo(() => {
        return data.filter((item) => {
            // === SEARCH FILTER ===
            const searchMatch = !search || fields.some((field) => {
                const values = getNestedValue(item, field);
                return values.some((value) => matchValue(value, search));
            });

            // === EXTRA FILTERS (Support nested paths) ===
            const extraMatch = Object.entries(extraFilters).every(([key, filterValue]) => {
                if (!filterValue || filterValue === "ALL") return true;

                // Date Range Filter
                if (key === "dateRange" && filterValue?.field) {
                    const rawDate = getNestedValue(item, filterValue.field)[0];
                    const itemDate = parseDateValue(rawDate);
                    const fromDate = parseDateValue(filterValue.from);
                    const toDate = parseDateValue(filterValue.to);

                    if ((fromDate || toDate) && (!itemDate || Number.isNaN(itemDate.getTime()))) {
                        return false;
                    }
                    if (fromDate && itemDate < fromDate) return false;
                    if (toDate && itemDate > toDate) return false;
                    return true;
                }

                // Nested value filter (e.g., "grnItem.status")
                const values = getNestedValue(item, key);
                return values.some((val) => {
                    if (val == null) return false;
                    return String(val).toLowerCase() === String(filterValue).toLowerCase();
                });
            });

            return searchMatch && extraMatch;
        });
    }, [data, fields, search, extraFilters]);
};

// Usage Examples

// 1. Simple Object Array
// const users = [
//     { name: "John", email: "john@gmail.com" },
//     { name: "Alice", email: "alice@gmail.com" },
// ];

// const { search, setSearch, filteredData } = useFilter({
//     data: users,
//     fields: ["name", "email"],
// });


// 2. Nested Object Search
// const products = [
//     {
//         name: "Shrimp",
//         category: {
//             name: "Seafood",
//         },
//     },
// ];

// const { filteredData } = useFilter({
//     data: products,
//     fields: ["name", "category.name"],
// });


// 3. Array Inside Object
// const suppliers = [
//     {
//         name: "ABC Supplier",
//         grades: [
//             { gradeName: "A" },
//             { gradeName: "B" },
//         ],
//     },
// ];

// const { filteredData } = useFilter({
//     data: suppliers,
//     fields: [
//         "name",
//         "grades[].gradeName",
//     ],
// });


// 4. Deep Nested Mixed Structure
// const data = [
//     {
//         supplier: {
//             company: {
//                 name: "Ocean Foods",
//             },
//         },
//         products: [
//             {
//                 grades: [
//                     { name: "Premium" },
//                 ],
//             },
//         ],
//     },
// ];

// const { filteredData } = useFilter({
//     data,
//     fields: [
//         "supplier.company.name",
//         "products[].grades[].name",
//     ],
// });