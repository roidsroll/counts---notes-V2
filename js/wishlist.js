// IndexedDB Configuration
const dbName = 'WishlistDB';
const dbVersion = 1;
let db;

// DOM Elements
const balanceDisplay = document.getElementById('balanceDisplay');
const savingsInput = document.getElementById('savingsInput');
const addSavingsBtn = document.getElementById('addSavingsBtn');
const withdrawSavingsBtn = document.getElementById('withdrawSavingsBtn');
const totalTargetDisplay = document.getElementById('totalTarget');
const totalProgressBar = document.getElementById('totalProgressBar');
const progressText = document.getElementById('progressText');
const addItemForm = document.getElementById('addItemForm');
const wishlistContainer = document.getElementById('wishlistContainer');
const emptyState = document.getElementById('emptyState');
const darkModeToggle = document.getElementById('darkModeToggle');

// State
let currentBalance = 0;
let wishlistItems = [];


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Splash screen logic
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 2000);
    }
    initDB();


    // Event Listeners
    if (addSavingsBtn) addSavingsBtn.addEventListener('click', () => updateSavings('add'));
    if (withdrawSavingsBtn) withdrawSavingsBtn.addEventListener('click', () => updateSavings('withdraw'));

    // Allow Enter key in savings input to trigger Add
    if (savingsInput) {
        savingsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') updateSavings('add');
        });
    }

    if (addItemForm) addItemForm.addEventListener('submit', addNewItem);

});

// Database Initialization
function initDB() {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = (event) => {
        console.error("Database error: " + event.target.errorCode);
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;

        // Create object store for items
        if (!db.objectStoreNames.contains('items')) {
            const objectStore = db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('order', 'order', { unique: false });
        }

        // Create object store for settings (balance)
        if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
        }
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadData();
    };
}

// Load Data from DB
function loadData() {
    // Load Balance
    const settingsTransaction = db.transaction(['settings'], 'readonly');
    const settingsStore = settingsTransaction.objectStore('settings');
    const balanceRequest = settingsStore.get('balance');

    balanceRequest.onsuccess = (event) => {
        if (event.target.result) {
            currentBalance = event.target.result.value;
        } else {
            currentBalance = 0;
        }
        updateBalanceUI();

        // Load Items
        loadItems();
    };
}

function loadItems() {
    const transaction = db.transaction(['items'], 'readonly');
    const objectStore = transaction.objectStore('items');
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
        wishlistItems = event.target.result;
        // Sort by order if needed
        wishlistItems.sort((a, b) => a.order - b.order);
        renderItems();
        updateCalculations();
    };
}

// Add New Item
function addNewItem(e) {
    e.preventDefault();

    const name = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('itemPrice').value);

    if (!name || isNaN(price)) return;

    const newItem = {
        name: name,
        price: price,
        order: wishlistItems.length // Append to end
    };

    const transaction = db.transaction(['items'], 'readwrite');
    const objectStore = transaction.objectStore('items');
    const request = objectStore.add(newItem);

    request.onsuccess = () => {
        document.getElementById('itemName').value = '';
        document.getElementById('itemPrice').value = '';
        loadItems(); // Reload to get the ID and refresh UI
    };
}

// Update Savings (Add/Withdraw)
function updateSavings(action) {
    const amount = parseFloat(savingsInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert('Mohon masukkan nominal yang valid');
        return;
    }

    if (action === 'add') {
        currentBalance += amount;
    } else if (action === 'withdraw') {
        if (amount > currentBalance) {
            alert('Saldo tidak mencukupi!');
            return;
        }
        currentBalance -= amount;
    }

    // Save to DB
    const transaction = db.transaction(['settings'], 'readwrite');
    const objectStore = transaction.objectStore('settings');
    objectStore.put({ key: 'balance', value: currentBalance });

    // Update UI
    savingsInput.value = '';
    updateBalanceUI();
    updateCalculations();
}

function updateBalanceUI() {
    if (balanceDisplay) balanceDisplay.textContent = formatRupiah(currentBalance);
}

// Delete Item
function deleteItem(id) {
    if (confirm('Yakin ingin menghapus keinginan ini?')) {
        const transaction = db.transaction(['items'], 'readwrite');
        const objectStore = transaction.objectStore('items');
        objectStore.delete(id);

        transaction.oncomplete = () => {
            loadItems();
        };
    }
}

// Move Item (Reorder)
function moveItem(index, direction) {
    if ((direction === -1 && index === 0) || (direction === 1 && index === wishlistItems.length - 1)) return;

    const itemA = wishlistItems[index];
    const itemB = wishlistItems[index + direction];

    // Swap orders
    const tempOrder = itemA.order;
    itemA.order = itemB.order;
    itemB.order = tempOrder;

    // Update DB
    const transaction = db.transaction(['items'], 'readwrite');
    const objectStore = transaction.objectStore('items');
    objectStore.put(itemA);
    objectStore.put(itemB);

    transaction.oncomplete = () => {
        loadItems();
    };
}

// Render Items
function renderItems() {
    wishlistContainer.innerHTML = '';

    if (wishlistItems.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    let accumulatedCost = 0;

    wishlistItems.forEach((item, index) => {
        accumulatedCost += item.price;

        let itemStatus = '';
        let itemProgress = 0;
        let statusColor = '';
        let statusText = '';

        if (currentBalance >= accumulatedCost) {
            itemStatus = 'Terpenuhi';
            itemProgress = 100;
            statusColor = 'bg-green-500';
            statusText = 'text-green-600 dark:text-green-400';
        } else if (currentBalance > (accumulatedCost - item.price)) {
            // Partially funded
            const availableForThis = currentBalance - (accumulatedCost - item.price);
            itemProgress = (availableForThis / item.price) * 100;
            itemStatus = `${Math.round(itemProgress)}%`;
            statusColor = 'bg-yellow-500';
            statusText = 'text-yellow-600 dark:text-yellow-400';
        } else {
            itemStatus = 'Menunggu';
            itemProgress = 0;
            statusColor = 'bg-gray-300 dark:bg-gray-600';
            statusText = 'text-gray-500 dark:text-gray-400';
        }

        const card = document.createElement('div');
        card.className = 'gradient-card p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 fade-in transition-all hover:shadow-md';

        card.innerHTML = `
            <div class="flex flex-col items-center gap-1 mr-2">
                <button onclick="moveItem(${index}, -1)" class="text-gray-400 hover:text-indigo-500 transition-colors ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}">
                    <i class="fas fa-chevron-up"></i>
                </button>
                <span class="font-bold text-gray-300 text-sm">#${index + 1}</span>
                <button onclick="moveItem(${index}, 1)" class="text-gray-400 hover:text-indigo-500 transition-colors ${index === wishlistItems.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            
            <div class="flex-grow w-full">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-lg text-gray-800 dark:text-white">${item.name}</h4>
                        <p class="gradient-text font-bold">${formatRupiah(item.price)}</p>
                    </div>
                    <div class="text-right">
                        <span class="text-sm font-bold ${statusText}">${itemStatus}</span>
                    </div>
                </div>
                
                <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
                    <div class="${statusColor} h-2 rounded-full transition-all duration-500" style="width: ${itemProgress}%"></div>
                </div>
            </div>
            
            <div class="flex gap-2 mt-2 sm:mt-0">
                <button onclick="deleteItem(${item.id})" class="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;

        wishlistContainer.appendChild(card);
    });
}

// Update Calculations (Total Target & Global Progress)
function updateCalculations() {
    const totalTarget = wishlistItems.reduce((sum, item) => sum + item.price, 0);
    totalTargetDisplay.textContent = formatRupiah(totalTarget);

    let progress = 0;
    if (totalTarget > 0) {
        progress = Math.min((currentBalance / totalTarget) * 100, 100);
    }

    totalProgressBar.style.width = `${progress}%`;
    progressText.textContent = `Tercapai ${Math.round(progress)}% dari total target`;

    // Re-render items to update their individual progress bars based on new balance
    renderItems();
}

// Utilities
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}


