import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const ExcelBuilder = async ({
    fileName = "Report.xlsx",
    sheetName = "Report",
    title = "",
    columns = [],
    rows = [],
}) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    const columnDefinitions = Array.isArray(columns) ? columns : [];
    const dataRows = Array.isArray(rows) ? rows : [];

    //------------------------------------
    // Title
    //------------------------------------

    if (title) {
        worksheet.mergeCells(1, 1, 1, columnDefinitions.length || 1);

        const cell = worksheet.getCell("A1");

        cell.value = title;

        cell.font = {
            bold: true,
            size: 18,
            color: {
                argb: "FFFFFFFF",
            },
        };

        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "0E7A91",
            },
        };

        cell.alignment = {
            horizontal: "center",
            vertical: "middle",
        };

        worksheet.addRow([]);
    }

    //------------------------------------
    // Header
    //------------------------------------

    worksheet.columns = columnDefinitions.map((c) => ({
        // header: c.header,
        key: c.key,
        width: c.width || 20,
    }));

    const headerRow = worksheet.addRow(columnDefinitions.map((c) => c.header));

    headerRow.eachCell((cell) => {
        cell.font = {
            bold: true,
            color: {
                argb: "FFFFFFFF",
            },
        };

        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "0E7A91",
            },
        };

        cell.alignment = {
            horizontal: "center",
            vertical: "middle",
        };

        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
        };
    });

    //------------------------------------
    // Data
    //------------------------------------

    dataRows.forEach((row) => {
        const excelRow = worksheet.addRow(row);

        excelRow.eachCell((cell, colNumber) => {
            const column = columnDefinitions[colNumber - 1];

            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
                bottom: { style: "thin" },
            };

            cell.alignment = {
                vertical: "middle",
            };

            //----------------------------------
            // Currency
            //----------------------------------

            if (column?.type === "currency") {
                cell.numFmt = "₹#,##0.00";
            }

            //----------------------------------
            // Date
            //----------------------------------

            if (column?.type === "date") {
                cell.numFmt = "dd-mmm-yyyy";
            }

            //----------------------------------
            // Status Color
            //----------------------------------

            if (column.key === "activityStatus") {
                if (cell.value === "Completed") {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: {
                            argb: "C6EFCE",
                        },
                    };
                } else {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: {
                            argb: "FFE699",
                        },
                    };
                }
            }

            //----------------------------------
            // Claim Status Color
            //----------------------------------

            if (column.key === "claimStatus") {
                if (cell.value === "Approved") {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: {
                            argb: "C6EFCE",
                        },
                    };
                }
            }
        });
    });

    //------------------------------------
    // Grand Total
    //------------------------------------

    // const totalColumn = columnDefinitions.findIndex((c) => c.key === "total") + 1;

    // if (totalColumn > 0) {
    //     const lastRow = worksheet.lastRow.number + 1;

    //     worksheet.getCell(lastRow, totalColumn - 1).value = "Grand Total";

    //     worksheet.getCell(lastRow, totalColumn).value = {
    //         formula: `SUM(${worksheet.getColumn(totalColumn).letter}4:${worksheet.getColumn(totalColumn).letter}${lastRow - 1})`,
    //     };

    //     worksheet.getCell(lastRow, totalColumn - 1).font = {
    //         bold: true,
    //     };

    //     worksheet.getCell(lastRow, totalColumn).font = {
    //         bold: true,
    //     };

    //     worksheet.getCell(lastRow, totalColumn).numFmt = "₹#,##0.00";
    // }

    // modified part only

    //------------------------------------
    // Grand Total
    //------------------------------------

    const sumKeys = ["actualRate", "claimAmount", "total"];

    const lastRow = worksheet.lastRow.number + 1;

    // find first data row (row 2 if no title, row 4 if title present)
    const firstDataRow = title ? 4 : 2;

    sumKeys.forEach((key) => {
        const colIndex = columnDefinitions.findIndex((c) => c.key === key) + 1;
        if (colIndex === 0) return;

        const colLetter = worksheet.getColumn(colIndex).letter;

        const cell = worksheet.getCell(lastRow, colIndex);

        cell.value = {
            formula: `SUM(${colLetter}${firstDataRow}:${colLetter}${lastRow - 1})`,
        };

        cell.font = { bold: true };
        cell.numFmt = "₹#,##0.00";
    });

    // Label in the column just before the first summed column
    const labelColIndex = columnDefinitions.findIndex((c) => c.key === sumKeys[0]) + 1;

    if (labelColIndex > 0) {
        const labelCell = worksheet.getCell(lastRow, labelColIndex - 1);
        labelCell.value = "Grand Total";
        labelCell.font = { bold: true };
    }

    //------------------------------------
    // Download
    //------------------------------------

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
        new Blob([buffer]),
        fileName
    );
};


export const ProfitabilityDashboardColumns = [
    { header: "Customer", key: "customer" },
    { header: "Order Item", key: "orderItemId" },
    { header: "Audit Type", key: "auditType" },
    { header: "Store", key: "storeLocation" },
    { header: "Status", key: "activityStatus" },

    {
        header: "Start Date",
        key: "startDate",
        type: "date",
    },

    {
        header: "End Date",
        key: "endDate",
        type: "date",
    },

    {
        header: "Plan Rate",
        key: "planRate",
        type: "currency",
    },

    {
        header: "Plan TL",
        key: "planTL",
    },

    {
        header: "Plan EX",
        key: "planEX",
    },

    {
        header: "Actual Rate",
        key: "actualRate",
        type: "currency",
    },

    {
        header: "Actual TL",
        key: "actualTL",
    },

    {
        header: "Actual EX",
        key: "actualEX",
    },

    {
        header: "Claim Status",
        key: "claimStatus",
    },

    {
        header: "Claim Amount",
        key: "claimAmount",
        type: "currency",
    },

    {
        header: "Total",
        key: "total",
        type: "currency",
    },
];