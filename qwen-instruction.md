# qwen-instruction.md

## Purpose

This document explains how to add a **Starting Balance** feature to a plain HTML + CSS + vanilla JavaScript note-taking web app (no DB) that records item entries (name, quantity, unit price → total) and exports data to **Excel (SheetJS)** and **PDF (jsPDF)**. Entries are always treated as **expenses** (i.e., they reduce the balance). Starting balance, entries, and ending balance are stored in **localStorage**.

It contains two main sections:

* **Developer**: technical design, file/structure, implementation details, snippets, integration with SheetJS and jsPDF.
* **Tutorial**: step-by-step guide to build the feature from scratch and how to add it to an existing app.

> Language: English

---

# Quick summary of behavior

* User sets a **Starting Balance** at the top of the page.
* When a user adds a record (Name, Quantity, Unit Price), app computes `total = quantity * unitPrice` and treats it as an **expense** (subtracts from balance).
* UI shows **Starting Balance**, **Total Expenses**, and **Ending Balance** (live-updated).
* All data (starting balance and entries) are persisted in `localStorage`.
* Exports (Excel & PDF) include each entry plus the starting and ending balances.

---

# Developer — Technical overview

## File structure (suggested)

```
/index.html
/styles.css
/script.js

```

> You can load SheetJS and jsPDF from local `vendor/` files or CDN. The code examples below assume the scripts are available in `<script>` tags.

## Key localStorage keys

* `startingBalance` — number (starting balance in cents or decimal). Stored as a number string.
* `entries` — JSON array of entry objects. Each entry shape:

  ```js
  { id: 'uuid-or-ts', name: 'Item name', quantity: 2, unitPrice: 10000, total: 20000, date: '2025-11-17T12:34:56.789Z' }
  ```

> Use consistent units for money (either cents as integer, or decimals). Examples below use decimals (floating numbers) but with careful formatting for display.

## Main responsibilities in code

1. Render Starting Balance UI (input + set/update button) above the entries table.
2. Persist and read `startingBalance` from `localStorage`.
3. Add entries: validate inputs, compute total, push to `entries` array in `localStorage`.
4. Recalculate totals and ending balance after every change.
5. Update UI (balances, table rows).
6. Export to Excel: include a header section containing starting and ending balances and list all entries.
7. Export to PDF: likewise include balances on top and entry table below.

---

# Implementation snippets — Complete minimal working example

> This is a **vanilla** HTML/CSS/JS full example you can drop into files. It uses SheetJS and jsPDF for export. The JS is written to be clear and production-ready (modular functions, defensive checks).


# Developer — Integration notes & tips

* **Money representation**: for higher accuracy use integer cents (`Math.round(value * 100)`) and only format to decimals on display. The example uses decimals for simplicity.
* **Validation**: always validate `quantity` and `unitPrice` before saving. The example enforces `quantity >= 1` and `unitPrice > 0`.
* **localStorage quota**: localStorage is limited (~5-10MB). For small lists it's fine. If users expect large datasets, consider prompting export/cleanup.
* **Export file names**: use ISO-like timestamps to avoid collisions. The example uses `entries_YYYY-MM-DDTHH-MM-SS`.
* **SheetJS usage**: the example uses `XLSX.utils.aoa_to_sheet` to create a sheet from an array-of-arrays, making it easy to create header rows for balances.
* **jsPDF & autotable**: `autotable` creates neat table layouts in PDF. Include `jspdf-autotable.min.js` and call `doc.autoTable({...})`.
* **UX**: place the starting balance controls above the table (as requested). Add colors and contrast so it fits your theme (the provided CSS uses deep navy + accent color). Ensure buttons are large enough for touch.

---

# Tutorial — Step-by-step: Add Starting Balance feature to an existing app

1. **Understand current app**: locate where your app stores entries (likely `localStorage` key like `entries`) and where table is rendered. We'll add a `startingBalance` key and a small UI block above the table.

2. **Add HTML UI**: Insert an input and set/reset buttons above your table, and three readouts for Starting / Total Expenses / Ending. (See `index.html` snippet in this document.)

3. **Implement storage helpers**: Add functions `saveStartingBalance` and `loadStartingBalance` that read/write `localStorage`.

4. **Recalculate flow**: After any change to entries or starting balance, call a function `renderBalances()` that recalculates `totalExpenses` (sum of `entry.total`) and computes `ending = starting - totalExpenses`. Update DOM accordingly.

5. **Make entries always expenses**: Ensure your `addEntry` function treats the `total` as an expense. Do not add logic for "income" in this change; all new entries subtract from the balance.

6. **Persist data**: Use `localStorage.setItem('startingBalance', amount)` and `localStorage.setItem('entries', JSON.stringify(entries))`.

7. **Export changes**: Update your export routines to include starting & ending balances in the exported files.

   * **SheetJS**: Build an `aoa` (array of arrays) that starts with balance rows, an empty row, then a header, then entries.
   * **jsPDF**: Draw starting/total/ending texts then use `autoTable` for the entries table.

8. **Edge cases**:

   * If `startingBalance` is missing, default to 0.
   * If entries have invalid totals (NaN), ignore or treat as 0.
   * For display, always format numbers to two decimals.

9. **Testing**:

   * Set starting balance 1,000.00
   * Add an item: qty 2, unit price 250.00 → total 500.00 → ending should be 500.00
   * Export to Excel/PDF and verify the balances are present at the top of the exported file.

---

# Tutorial — Build from zero (assume no prior code)

Follow these steps exactly:

1. Create the three files `index.html`, `styles.css`, `app.js` with content from the earlier "Complete minimal working example".
2. Download SheetJS `xlsx.full.min.js` and put in `vendor/` or reference via CDN.
3. Download jsPDF `jspdf.umd.min.js` and `jspdf-autotable.min.js` and add them to `vendor/` or use CDN links.
4. Open `index.html` in a modern browser. The app should load and show "Starting Balance" controls.
5. Set a starting balance. Add entries. Observe that Starting / Total Expenses / Ending update automatically.
6. Click "Export Excel" and "Export PDF" to verify files include balances.
7. (Optional) Tweak CSS to match your theme, or copy the CSS variables into your existing stylesheet.

---

# Extra features & future improvements (ideas)

* Add **incoming** entry type (income) and toggle type on the entry form. For now, everything is expense as requested.
* Add categories/tags and group totals by category.
* Add CSV export option.
* Add import (read exported XLSX and repopulate localStorage).
* Add a compact mobile layout with collapsible balance readout.

---

# Troubleshooting

* **Exports not working**: ensure SheetJS and jsPDF scripts are correctly loaded. Check the console for errors like `XLSX is not defined` or `window.jspdf is undefined`.
* **Numbers look weird**: check locale formatting. The code uses `toLocaleString()` for display only. For calculations, rely on numeric values.
* **localStorage full**: clear entries or prompt the user to export & clear.

---

# Final notes

* The code in this document is intentionally dependency-light and uses only the two allowed external libraries for export. It stores everything in `localStorage` and places the starting-balance controls above the table as requested.
* If you want, I can also generate a single-file version (all HTML/CSS/JS combined) or a minimized distribution for embedding into an existing page.

---

*End of qwen-instruction.md*
