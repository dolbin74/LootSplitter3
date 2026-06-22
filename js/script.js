// ---------------------------------------------------------
// Dungeon Loot Splitter - Phase 3 (Integrated with Phase 2)
// ---------------------------------------------------------

// PHASE 3 ADDITION #1 — Storage key
const STORAGE_KEY = "lootSplitterState";

// The loot array is the single source of truth.
let loot = []; 
let partySize = 1;

// ---------------------------------------------------------
// Grab DOM elements
// ---------------------------------------------------------
const partySizeInput = document.getElementById("partySize");
const lootNameInput = document.getElementById("lootName");
const lootValueInput = document.getElementById("lootValue");
const lootQtyInput = document.getElementById("lootQty");

const lootRows = document.getElementById("lootRows");
const noLootMessage = document.getElementById("noLootMessage");
const totalLootElement = document.getElementById("totalLoot");

const finalTotalElement = document.getElementById("finalTotal");
const perMemberElement = document.getElementById("perMember");

const lootError = document.getElementById("lootError");
const partyError = document.getElementById("partyError");
const splitError = document.getElementById("splitError");

const splitBtn = document.getElementById("splitLootBtn");

// ---------------------------------------------------------
// PHASE 3 ADDITION #2 — saveState()
// ---------------------------------------------------------
function saveState() {
    const state = {
        loot: loot,
        partySize: partySize
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------------------------------------------------------
// PHASE 3 ADDITION #3 — restoreState()
// ---------------------------------------------------------
function restoreState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
        const parsed = JSON.parse(saved);

        if (typeof parsed !== "object") return;
        if (!Array.isArray(parsed.loot)) return;

        loot = [];

        parsed.loot.forEach(item => {
            if (
                item.name &&
                typeof item.name === "string" &&
                typeof item.value === "number" &&
                item.value >= 0 &&
                typeof item.quantity === "number" &&
                item.quantity >= 1
            ) {
                loot.push(item);
            }
        });

        if (typeof parsed.partySize === "number" && parsed.partySize >= 1) {
            partySize = parsed.partySize;
            partySizeInput.value = partySize;
        }

    } catch (err) {
        loot = [];
        partySize = 1;
    }
}

// ---------------------------------------------------------
// addLoot()
// ---------------------------------------------------------
function addLoot() {
    lootError.textContent = "";

    let name = lootNameInput.value.trim();
    let value = parseFloat(lootValueInput.value);
    let qty = parseInt(lootQtyInput.value);

    if (name === "") {
        lootError.textContent = "Loot name cannot be empty.";
        return;
    }
    if (isNaN(value) || value < 0) {
        lootError.textContent = "Loot value must be a valid number.";
        return;
    }
    if (isNaN(qty) || qty < 1) {
        lootError.textContent = "Quantity must be 1 or greater.";
        return;
    }

    loot.push({ name, value, quantity: qty });

    lootNameInput.value = "";
    lootValueInput.value = "";
    lootQtyInput.value = "";

    // PHASE 3 ADDITION
    saveState();

    updateUI();
}

// ---------------------------------------------------------
// removeLoot()
// ---------------------------------------------------------
function removeLoot(index) {
    loot.splice(index, 1);

    // PHASE 3 ADDITION #5
    saveState();

    updateUI();
}

// ---------------------------------------------------------
// handleSplit()
// ---------------------------------------------------------
function handleSplit() {
    splitError.textContent = "";

    let partySize = parseInt(partySizeInput.value);

    if (isNaN(partySize) || partySize < 1) {
        splitError.textContent = "Party size must be 1 or greater.";
        return;
    }

    if (loot.length === 0) {
        splitError.textContent = "No loot to split.";
        return;
    }

    let total = 0;
    for (let i = 0; i < loot.length; i++) {
        total += loot[i].value * loot[i].quantity;
    }

    let tax = 0;
    if (total > 100) {
        tax = total * 0.10;
        total -= tax;
        splitError.textContent = `Guild Tax Applied: $${tax.toFixed(2)}`;
    }

    let perPerson = total / partySize;

    finalTotalElement.textContent = `Total Loot (after tax): $${total.toFixed(2)}`;
    perMemberElement.textContent = `Loot Per Party Member: $${perPerson.toFixed(2)}`;

    finalTotalElement.classList.remove("hidden");
    perMemberElement.classList.remove("hidden");
}

// ---------------------------------------------------------
// updateUI()
// ---------------------------------------------------------
function updateUI() {
    lootRows.innerHTML = "";

    if (loot.length === 0) {
        noLootMessage.classList.remove("hidden");
        totalLootElement.textContent = "0.00";
        splitBtn.disabled = true;

        finalTotalElement.classList.add("hidden");
        perMemberElement.classList.add("hidden");
        return;
    }

    noLootMessage.classList.add("hidden");

    let total = 0;

    for (let i = 0; i < loot.length; i++) {
        let row = document.createElement("div");
        row.className = "loot-row";

        let nameCell = document.createElement("div");
        nameCell.className = "loot-cell";
        nameCell.innerText = loot[i].name;

        let valueCell = document.createElement("div");
        valueCell.className = "loot-cell";
        valueCell.innerText = loot[i].value.toFixed(2);

        let qtyCell = document.createElement("div");
        qtyCell.className = "loot-cell";
        qtyCell.innerText = loot[i].quantity;

        let actionCell = document.createElement("div");
        actionCell.className = "loot-cell";

        let removeBtn = document.createElement("button");
        removeBtn.innerText = "Remove";
        removeBtn.onclick = function () {
            removeLoot(i);
        };

        actionCell.appendChild(removeBtn);

        row.appendChild(nameCell);
        row.appendChild(valueCell);
        row.appendChild(qtyCell);
        row.appendChild(actionCell);

        lootRows.appendChild(row);

        total += loot[i].value * loot[i].quantity;
    }

    totalLootElement.textContent = total.toFixed(2);

    let partySize = parseInt(partySizeInput.value);
    splitBtn.disabled = isNaN(partySize) || partySize < 1;
}

// ---------------------------------------------------------
// PHASE 3 ADDITION #4 — Reset All
// ---------------------------------------------------------
function resetAll() {
    loot = [];
    partySize = 1;
    localStorage.removeItem(STORAGE_KEY);
    partySizeInput.value = "";
    updateUI();
}

// ---------------------------------------------------------
// Event Listeners
// ---------------------------------------------------------
document.getElementById("addLootBtn").onclick = addLoot;
splitBtn.onclick = handleSplit;
partySizeInput.oninput = function () {
    partySize = parseInt(partySizeInput.value) || 1;

    // PHASE 3 ADDITION
    saveState();

    updateUI();
};

// PHASE 3 ADDITION #5 — Reset button listener
document.getElementById("resetBtn").onclick = resetAll;

// PHASE 3 ADDITION #6 — Restore state on load
restoreState();
updateUI();
