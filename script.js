// script.js

// Initialize jsPDF
window.jspdf = window.jspdf || {};
window.jspdf.jsPDF = window.jspdf.jsPDF || function() {};

// DOM Elements
const itemTableBody = document.getElementById('itemTableBody');
const mobileItemCards = document.getElementById('mobileItemCards');
const addItemBtn = document.getElementById('addItemBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const downloadExcelBtn = document.getElementById('downloadExcelBtn');
const totalAmount = document.getElementById('totalAmount');
const darkModeToggle = document.getElementById('darkModeToggle');
const validationMessage = document.getElementById('validationMessage');
const addItemSound = document.getElementById('addItemSound');

// State
let isDarkMode = false;
let isMobileView = window.innerWidth <= 640;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Splash screen logic
    const splashScreen = document.getElementById('splash-screen');
    setTimeout(() => {
        splashScreen.classList.add('hidden');
    }, 2000);

    // Load data from localStorage if available
    loadDataFromLocalStorage();
    
    // Add event listeners
    addItemBtn.addEventListener('click', addNewItemRow);
    downloadPdfBtn.addEventListener('click', downloadAsPDF);
    downloadExcelBtn.addEventListener('click', downloadAsExcel);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Add event listeners to existing rows
    updateEventListeners();
    
    // Check for mobile view on load
    checkMobileView();
    
    // Add resize listener
    window.addEventListener('resize', checkMobileView);
    
    // Calculate initial total
    calculateTotal();
});

// Check if we're in mobile view
function checkMobileView() {
    const newIsMobileView = window.innerWidth <= 640;
    if (newIsMobileView !== isMobileView) {
        isMobileView = newIsMobileView;
        renderMobileCards();
    }
}

// Add new item row
function addNewItemRow() {
    // Play sound effect
    if (addItemSound) {
        addItemSound.currentTime = 0;
        addItemSound.play().catch(e => console.log("Audio play failed:", e));
    }
    
    if (isMobileView) {
        addNewMobileCard();
    } else {
        addNewDesktopRow();
    }
    saveDataToLocalStorage();
}

// Add new desktop row
function addNewDesktopRow() {
    const newRow = document.createElement('tr');
    newRow.className = 'border-b border-gray-200 fade-in';
    newRow.innerHTML = `
        <td class="py-3 px-3 sm:px-4">
            <input type="text" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Nama barang">
        </td>
        <td class="py-3 px-3 sm:px-4">
            <input type="number" min="1" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm jumlah-input" placeholder="0" value="1">
        </td>
        <td class="py-3 px-3 sm:px-4">
            <input type="number" min="0" step="100" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm harga-input" placeholder="0" value="0">
        </td>
        <td class="py-3 px-3 sm:px-4 font-medium total-cell text-sm">
            0
        </td>
        <td class="py-3 px-3 sm:px-4 text-center action-cell">
            <div class="flex justify-center gap-1">
                <button class="copy-row p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full transition-colors duration-300 shadow-md hover:shadow-lg">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="add-comment p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors duration-300 shadow-md hover:shadow-lg">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="delete-row p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors duration-300 shadow-md hover:shadow-lg">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="comment-section hidden mt-2">
                <textarea class="comment-input w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Tambahkan catatan..." rows="2"></textarea>
                <div class="flex justify-end gap-1 mt-1">
                    <button class="save-comment px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Simpan</button>
                    <button class="cancel-comment px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">Batal</button>
                </div>
            </div>
        </td>
    `;
    
    itemTableBody.appendChild(newRow);
    updateEventListeners();
}

// Add new mobile card
function addNewMobileCard() {
    const newCard = document.createElement('div');
    newCard.className = `mobile-card gradient-card fade-in ${isDarkMode ? 'dark-mode' : ''}`;
    newCard.innerHTML = `
        <div class="mobile-card-header">
            <h3 class="font-semibold text-gray-800 dark:text-white">Barang Baru</h3>
            <div class="flex gap-1">
                <button class="copy-card p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full transition-colors duration-300">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="add-comment-card p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors duration-300">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="delete-card p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors duration-300">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="mobile-card-content">
            <div class="mobile-card-input">
                <label class="text-gray-700 dark:text-gray-300">Nama Barang</label>
                <input type="text" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Nama barang">
            </div>
            <div class="mobile-card-input">
                <label class="text-gray-700 dark:text-gray-300">Jumlah</label>
                <input type="number" min="1" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm jumlah-input" placeholder="0" value="1">
            </div>
            <div class="mobile-card-input">
                <label class="text-gray-700 dark:text-gray-300">Harga Satuan</label>
                <input type="number" min="0" step="100" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm harga-input" placeholder="0" value="0">
            </div>
            <div class="mobile-card-input">
                <label class="text-gray-700 dark:text-gray-300">Total</label>
                <div class="p-2 font-medium total-cell text-sm">0</div>
            </div>
            <div class="comment-section-card hidden mt-2">
                <textarea class="comment-input-card w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Tambahkan catatan..." rows="2"></textarea>
                <div class="flex justify-end gap-1 mt-1">
                    <button class="save-comment-card px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Simpan</button>
                    <button class="cancel-comment-card px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">Batal</button>
                </div>
            </div>
        </div>
    `;
    
    mobileItemCards.appendChild(newCard);
    updateMobileEventListeners();
}

// Update event listeners for all rows
function updateEventListeners() {
    // Add input event listeners for calculation
    const jumlahInputs = document.querySelectorAll('.jumlah-input');
    const hargaInputs = document.querySelectorAll('.harga-input');
    const deleteButtons = document.querySelectorAll('.delete-row');
    const addCommentButtons = document.querySelectorAll('.add-comment');
    const saveCommentButtons = document.querySelectorAll('.save-comment');
    const cancelCommentButtons = document.querySelectorAll('.cancel-comment');
    const copyButtons = document.querySelectorAll('.copy-row');
    
    jumlahInputs.forEach(input => {
        input.addEventListener('input', calculateRowTotal);
    });
    
    hargaInputs.forEach(input => {
        input.addEventListener('input', calculateRowTotal);
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', deleteRow);
    });
    
    // Add comment event listeners
    addCommentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const commentSection = row.querySelector('.comment-section');
            commentSection.classList.remove('hidden');
        });
    });
    
    saveCommentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const commentInput = row.querySelector('.comment-input');
            const commentSection = row.querySelector('.comment-section');
            // Here you could save the comment to localStorage or process it
            commentSection.classList.add('hidden');
        });
    });
    
    cancelCommentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const commentInput = row.querySelector('.comment-input');
            const commentSection = row.querySelector('.comment-section');
            commentInput.value = ''; // Clear the comment
            commentSection.classList.add('hidden');
        });
    });
    
    // Add copy event listeners
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const nameInput = row.querySelector('input[type="text"]');
            const jumlahInput = row.querySelector('.jumlah-input');
            const hargaInput = row.querySelector('.harga-input');
            
            // Create a new row with the same values
            const newRow = document.createElement('tr');
            newRow.className = 'border-b border-gray-200 fade-in';
            newRow.innerHTML = `
                <td class="py-3 px-3 sm:px-4">
                    <input type="text" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" value="${nameInput.value}">
                </td>
                <td class="py-3 px-3 sm:px-4">
                    <input type="number" min="1" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm jumlah-input" value="${jumlahInput.value}">
                </td>
                <td class="py-3 px-3 sm:px-4">
                    <input type="number" min="0" step="100" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm harga-input" value="${hargaInput.value}">
                </td>
                <td class="py-3 px-3 sm:px-4 font-medium total-cell text-sm">
                    0
                </td>
                <td class="py-3 px-3 sm:px-4 text-center action-cell">
                    <div class="flex justify-center gap-1">
                        <button class="copy-row p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full transition-colors duration-300">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="add-comment p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors duration-300">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="delete-row p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors duration-300">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="comment-section hidden mt-2">
                        <textarea class="comment-input w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Tambahkan catatan..." rows="2"></textarea>
                        <div class="flex justify-end gap-1 mt-1">
                            <button class="save-comment px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Simpan</button>
                            <button class="cancel-comment px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">Batal</button>
                        </div>
                    </div>
                </td>
            `;
            
            // Insert the new row after the current row
            row.parentNode.insertBefore(newRow, row.nextSibling);
            
            // Update event listeners to include the new row
            updateEventListeners();
            
            // Calculate the total for the new row
            calculateRowTotal({ target: newRow.querySelector('.jumlah-input') });
            
            // Save to localStorage
            saveDataToLocalStorage();
        });
    });
}

// Update event listeners for mobile cards
function updateMobileEventListeners() {
    // Add input event listeners for calculation
    const jumlahInputs = mobileItemCards.querySelectorAll('.jumlah-input');
    const hargaInputs = mobileItemCards.querySelectorAll('.harga-input');
    const deleteButtons = mobileItemCards.querySelectorAll('.delete-card');
    const addCommentButtons = mobileItemCards.querySelectorAll('.add-comment-card');
    const saveCommentButtons = mobileItemCards.querySelectorAll('.save-comment-card');
    const cancelCommentButtons = mobileItemCards.querySelectorAll('.cancel-comment-card');
    const copyButtons = mobileItemCards.querySelectorAll('.copy-card');
    
    jumlahInputs.forEach(input => {
        input.addEventListener('input', calculateMobileCardTotal);
    });
    
    hargaInputs.forEach(input => {
        input.addEventListener('input', calculateMobileCardTotal);
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', deleteMobileCard);
    });
    
    // Add comment event listeners
    addCommentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.mobile-card');
            const commentSection = card.querySelector('.comment-section-card');
            commentSection.classList.remove('hidden');
        });
    });
    
    saveCommentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.mobile-card');
            const commentInput = card.querySelector('.comment-input-card');
            const commentSection = card.querySelector('.comment-section-card');
            // Here you could save the comment to localStorage or process it
            commentSection.classList.add('hidden');
        });
    });
    
    cancelCommentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.mobile-card');
            const commentInput = card.querySelector('.comment-input-card');
            const commentSection = card.querySelector('.comment-section-card');
            commentInput.value = ''; // Clear the comment
            commentSection.classList.add('hidden');
        });
    });
    
    // Add copy event listeners
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.mobile-card');
            const nameInput = card.querySelector('input[type="text"]');
            const jumlahInput = card.querySelector('.jumlah-input');
            const hargaInput = card.querySelector('.harga-input');
            
            // Create a new card with the same values
            const newCard = document.createElement('div');
            newCard.className = `mobile-card gradient-card fade-in ${isDarkMode ? 'dark-mode' : ''}`;
            newCard.innerHTML = `
                <div class="mobile-card-header">
                    <h3 class="font-semibold text-gray-800 dark:text-white">Barang</h3>
                    <div class="flex gap-1">
                        <button class="copy-card p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full transition-colors duration-300">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="add-comment-card p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors duration-300">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="delete-card p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors duration-300">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="mobile-card-content">
                    <div class="mobile-card-input">
                        <label class="text-gray-700 dark:text-gray-300">Nama Barang</label>
                        <input type="text" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" value="${nameInput.value}">
                    </div>
                    <div class="mobile-card-input">
                        <label class="text-gray-700 dark:text-gray-300">Jumlah</label>
                        <input type="number" min="1" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm jumlah-input" value="${jumlahInput.value}">
                    </div>
                    <div class="mobile-card-input">
                        <label class="text-gray-700 dark:text-gray-300">Harga Satuan</label>
                        <input type="number" min="0" step="100" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm harga-input" value="${hargaInput.value}">
                    </div>
                    <div class="mobile-card-input">
                        <label class="text-gray-700 dark:text-gray-300">Total</label>
                        <div class="p-2 font-medium total-cell text-sm">0</div>
                    </div>
                    <div class="comment-section-card hidden mt-2">
                        <textarea class="comment-input-card w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Tambahkan catatan..." rows="2"></textarea>
                        <div class="flex justify-end gap-1 mt-1">
                            <button class="save-comment-card px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Simpan</button>
                            <button class="cancel-comment-card px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">Batal</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert the new card after the current card
            card.parentNode.insertBefore(newCard, card.nextSibling);
            
            // Update event listeners to include the new card
            updateMobileEventListeners();
            
            // Calculate the total for the new card
            calculateMobileCardTotal({ target: newCard.querySelector('.jumlah-input') });
            
            // Save to localStorage
            saveDataToLocalStorage();
        });
    });
}

// Calculate row total
function calculateRowTotal(event) {
    const row = event.target.closest('tr');
    const jumlahInput = row.querySelector('.jumlah-input');
    const hargaInput = row.querySelector('.harga-input');
    const totalCell = row.querySelector('.total-cell');
    
    const jumlah = parseFloat(jumlahInput.value) || 0;
    const harga = parseFloat(hargaInput.value) || 0;
    const total = jumlah * harga;
    
    totalCell.textContent = formatRupiah(total);
    calculateTotal();
    saveDataToLocalStorage();
}

// Calculate mobile card total
function calculateMobileCardTotal(event) {
    const card = event.target.closest('.mobile-card');
    const jumlahInput = card.querySelector('.jumlah-input');
    const hargaInput = card.querySelector('.harga-input');
    const totalCell = card.querySelector('.total-cell');
    
    const jumlah = parseFloat(jumlahInput.value) || 0;
    const harga = parseFloat(hargaInput.value) || 0;
    const total = jumlah * harga;
    
    totalCell.textContent = formatRupiah(total);
    calculateTotal();
    saveDataToLocalStorage();
}

// Calculate total amount
function calculateTotal() {
    let total = 0;
    
    if (isMobileView) {
        // For mobile view, get totals from cards
        const totalCells = mobileItemCards.querySelectorAll('.total-cell');
        totalCells.forEach(cell => {
            const value = parseFloat(cell.textContent.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
            total += value;
        });
    } else {
        // For desktop view, get totals from table
        const totalCells = document.querySelectorAll('.total-cell');
        totalCells.forEach(cell => {
            const value = parseFloat(cell.textContent.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
            total += value;
        });
    }
    
    totalAmount.textContent = formatRupiah(total);
}

// Format number to Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

// Delete row
function deleteRow(event) {
    const row = event.target.closest('tr');
    if (itemTableBody.children.length > 1) {
        row.remove();
        calculateTotal();
        saveDataToLocalStorage();
    } else {
        // If it's the last row, clear the inputs but don't delete
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
        const totalCell = row.querySelector('.total-cell');
        totalCell.textContent = '0';
        calculateTotal();
        saveDataToLocalStorage();
    }
}

// Delete mobile card
function deleteMobileCard(event) {
    const card = event.target.closest('.mobile-card');
    if (mobileItemCards.children.length > 1) {
        card.remove();
        calculateTotal();
        saveDataToLocalStorage();
    } else {
        // If it's the last card, clear the inputs but don't delete
        const inputs = card.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
        const totalCell = card.querySelector('.total-cell');
        totalCell.textContent = '0';
        calculateTotal();
        saveDataToLocalStorage();
    }
}

// Render mobile cards based on desktop data
function renderMobileCards() {
    if (!isMobileView) return;
    
    // Get all rows data
    const rows = itemTableBody.querySelectorAll('tr');
    mobileItemCards.innerHTML = '';
    
    rows.forEach(row => {
        const nameInput = row.querySelector('input[type="text"]');
        const jumlahInput = row.querySelector('.jumlah-input');
        const hargaInput = row.querySelector('.harga-input');
        const totalCell = row.querySelector('.total-cell');
        
        const newCard = document.createElement('div');
        newCard.className = `mobile-card gradient-card fade-in ${isDarkMode ? 'dark-mode' : ''}`;
        newCard.innerHTML = `
            <div class="mobile-card-header">
                <h3 class="font-semibold text-gray-800 dark:text-white">Barang</h3>
                <div class="flex gap-1">
                    <button class="copy-card p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full transition-colors duration-300">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="add-comment-card p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors duration-300">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="delete-card p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors duration-300">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="mobile-card-content">
                <div class="mobile-card-input">
                    <label class="text-gray-700 dark:text-gray-300">Nama Barang</label>
                    <input type="text" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Nama barang" value="${nameInput.value}">
                </div>
                <div class="mobile-card-input">
                    <label class="text-gray-700 dark:text-gray-300">Jumlah</label>
                    <input type="number" min="1" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm jumlah-input" placeholder="0" value="${jumlahInput.value}">
                </div>
                <div class="mobile-card-input">
                    <label class="text-gray-700 dark:text-gray-300">Harga Satuan</label>
                    <input type="number" min="0" step="100" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm harga-input" placeholder="0" value="${hargaInput.value}">
                </div>
                <div class="mobile-card-input">
                    <label class="text-gray-700 dark:text-gray-300">Total</label>
                    <div class="p-2 font-medium total-cell text-sm">${totalCell.textContent}</div>
                </div>
                <div class="comment-section-card hidden mt-2">
                    <textarea class="comment-input-card w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Tambahkan catatan..." rows="2"></textarea>
                    <div class="flex justify-end gap-1 mt-1">
                        <button class="save-comment-card px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Simpan</button>
                        <button class="cancel-comment-card px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">Batal</button>
                    </div>
                </div>
            </div>
        `;
        
        mobileItemCards.appendChild(newCard);
    });
    
    updateMobileEventListeners();
}

// Download as PDF
function downloadAsPDF() {
    // Validate inputs
    if (!validateInputs()) {
        showValidationMessage();
        return;
    }
    
    // Create a new PDF document
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set font styles
    doc.setFont("helvetica");
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("COUNT & NOTES", 105, 20, null, null, "center");
    
    // Add date
    const today = new Date();
    const dateStr = today.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    doc.setFontSize(12);
    doc.text(`Tanggal: ${dateStr}`, 105, 30, null, null, "center");
    
    // Add line separator
    doc.line(20, 35, 190, 35);
    
    // Get item data
    let items = [];
    let totalAmountValue = 0;
    
    if (isMobileView) {
        // For mobile view, get data from cards
        const cards = mobileItemCards.querySelectorAll('.mobile-card');
        cards.forEach(card => {
            const nameInput = card.querySelector('input[type="text"]');
            const jumlahInput = card.querySelector('.jumlah-input');
            const hargaInput = card.querySelector('.harga-input');
            const totalCell = card.querySelector('.total-cell');
            
            const jumlah = parseFloat(jumlahInput.value) || 0;
            const harga = parseFloat(hargaInput.value) || 0;
            const total = parseFloat(totalCell.textContent.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
            
            items.push({
                name: nameInput.value,
                jumlah: jumlah,
                harga: harga,
                total: total
            });
            
            totalAmountValue += total;
        });
    } else {
        // For desktop view, get data from table
        const rows = itemTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const nameInput = row.querySelector('input[type="text"]');
            const jumlahInput = row.querySelector('.jumlah-input');
            const hargaInput = row.querySelector('.harga-input');
            const totalCell = row.querySelector('.total-cell');
            
            const jumlah = parseFloat(jumlahInput.value) || 0;
            const harga = parseFloat(hargaInput.value) || 0;
            const total = parseFloat(totalCell.textContent.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
            
            items.push({
                name: nameInput.value,
                jumlah: jumlah,
                harga: harga,
                total: total
            });
            
            totalAmountValue += total;
        });
    }
    
    // Add items to PDF in table format
    let yPosition = 45;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DAFTAR BARANG:", 20, yPosition);
    yPosition += 10;
    
    doc.setFont("helvetica", "normal");
    
    if (items.length > 0) {
        // Table header
        doc.setFont("helvetica", "bold");
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPosition, 170, 10, 'F');
        doc.text("No.", 25, yPosition + 7);
        doc.text("Nama Barang", 35, yPosition + 7);
        doc.text("Jumlah", 95, yPosition + 7);
        doc.text("Harga Satuan", 120, yPosition + 7);
        doc.text("Total", 160, yPosition + 7);
        doc.setFont("helvetica", "normal");
        yPosition += 10;
        
        // Table rows
        items.forEach((item, index) => {
            // Check if we need a new page
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
                
                // Re-add table header on new page
                doc.setFont("helvetica", "bold");
                doc.setFillColor(240, 240, 240);
                doc.rect(20, yPosition, 170, 10, 'F');
                doc.text("No.", 25, yPosition + 7);
                doc.text("Nama Barang", 35, yPosition + 7);
                doc.text("Jumlah", 95, yPosition + 7);
                doc.text("Harga Satuan", 120, yPosition + 7);
                doc.text("Total", 160, yPosition + 7);
                doc.setFont("helvetica", "normal");
                yPosition += 10;
            }
            
            // Format harga satuan and total
            const hargaSatuanFormatted = formatRupiah(item.harga);
            const totalFormatted = formatRupiah(item.total);
            
            // Table row
            doc.text(`${index + 1}`, 25, yPosition + 7);
            doc.text(item.name, 35, yPosition + 7);
            doc.text(item.jumlah.toString(), 95, yPosition + 7);
            doc.text(hargaSatuanFormatted, 120, yPosition + 7);
            doc.text(totalFormatted, 160, yPosition + 7);
            
            // Draw row border
            doc.rect(20, yPosition, 170, 10);
            
            yPosition += 10;
        });
    } else {
        doc.text("Tidak ada barang yang dimasukkan.", 20, yPosition);
        yPosition += 10;
    }
    
    // Add total
    // Check if we need a new page for the total
    if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
    }
    
    // Add spacing before total
    yPosition += 10;
    
    // Add total with better formatting
    doc.setFont("helvetica", "bold");
    doc.setFillColor(230, 230, 255);
    doc.rect(20, yPosition, 170, 15, 'F');
    doc.setTextColor(0, 0, 139);
    doc.text("TOTAL:", 25, yPosition + 10);
    doc.text(formatRupiah(totalAmountValue), 160, yPosition + 10);
    doc.setTextColor(0, 0, 0);
    
    // Save the PDF
    doc.save('perhitungan-barang.pdf');
}

// Download as Excel
function downloadAsExcel() {
    // Validate inputs
    if (!validateInputs()) {
        showValidationMessage();
        return;
    }

    // Get item data
    let items = [];
    let totalAmountValue = 0;

    if (isMobileView) {
        // For mobile view, get data from cards
        const cards = mobileItemCards.querySelectorAll('.mobile-card');
        cards.forEach(card => {
            const nameInput = card.querySelector('input[type="text"]');
            const jumlahInput = card.querySelector('.jumlah-input');
            const hargaInput = card.querySelector('.harga-input');
            const totalCell = card.querySelector('.total-cell');

            const jumlah = parseFloat(jumlahInput.value) || 0;
            const harga = parseFloat(hargaInput.value) || 0;
            const total = parseFloat(totalCell.textContent.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;

            items.push({
                name: nameInput.value,
                jumlah: jumlah,
                harga: harga,
                total: total
            });

            totalAmountValue += total;
        });
    } else {
        // For desktop view, get data from table
        const rows = itemTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const nameInput = row.querySelector('input[type="text"]');
            const jumlahInput = row.querySelector('.jumlah-input');
            const hargaInput = row.querySelector('.harga-input');
            const totalCell = row.querySelector('.total-cell');

            const jumlah = parseFloat(jumlahInput.value) || 0;
            const harga = parseFloat(hargaInput.value) || 0;
            const total = parseFloat(totalCell.textContent.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;

            items.push({
                name: nameInput.value,
                jumlah: jumlah,
                harga: harga,
                total: total
            });

            totalAmountValue += total;
        });
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create a new worksheet
    const ws_data = [
        ["COUNT & NOTES"],
        [`Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`],
        [],
        ["No.", "Nama Barang", "Jumlah", "Harga Satuan", "Total"]
    ];

    items.forEach((item, index) => {
        ws_data.push([index + 1, item.name, item.jumlah, item.harga, item.total]);
    });

    ws_data.push([]);
    ws_data.push(["", "", "", "TOTAL:", totalAmountValue]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Add borders to all cells
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!ws[cell_ref]) continue;
            if (!ws[cell_ref].s) ws[cell_ref].s = {};
            ws[cell_ref].s.border = {
                top: { style: "thin", color: { auto: 1 } },
                right: { style: "thin", color: { auto: 1 } },
                bottom: { style: "thin", color: { auto: 1 } },
                left: { style: "thin", color: { auto: 1 } }
            };
        }
    }

    // Set column widths
    ws['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];


    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Perhitungan");

    // Write the workbook and trigger download
    XLSX.writeFile(wb, 'perhitungan-barang.xlsx');
}

// Validate inputs
function validateInputs() {
    if (isMobileView) {
        const cards = mobileItemCards.querySelectorAll('.mobile-card');
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const nameInput = card.querySelector('input[type="text"]');
            const jumlahInput = card.querySelector('.jumlah-input');
            const hargaInput = card.querySelector('.harga-input');
            
            if (!nameInput.value.trim() || !jumlahInput.value || !hargaInput.value) {
                return false;
            }
        }
    } else {
        const rows = itemTableBody.querySelectorAll('tr');
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const nameInput = row.querySelector('input[type="text"]');
            const jumlahInput = row.querySelector('.jumlah-input');
            const hargaInput = row.querySelector('.harga-input');
            
            if (!nameInput.value.trim() || !jumlahInput.value || !hargaInput.value) {
                return false;
            }
        }
    }
    return true;
}

// Show validation message
function showValidationMessage() {
    validationMessage.classList.remove('hidden');
    setTimeout(() => {
        validationMessage.classList.add('hidden');
    }, 3000);
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // Update mobile cards if in mobile view
    if (isMobileView) {
        const cards = mobileItemCards.querySelectorAll('.mobile-card');
        cards.forEach(card => {
            if (isDarkMode) {
                card.classList.add('dark-mode');
            } else {
                card.classList.remove('dark-mode');
            }
        });
    } else {
        // Update desktop table rows
        const rows = itemTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            // The dark mode classes should automatically apply
            // But we can force re-render if needed
        });
    }
    
    // Update icon
    const icon = darkModeToggle.querySelector('i');
    if (isDarkMode) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode);
}

// Save data to localStorage
function saveDataToLocalStorage() {
    let data = [];
    
    if (isMobileView) {
        // For mobile view, get data from cards
        const cards = mobileItemCards.querySelectorAll('.mobile-card');
        cards.forEach(card => {
            const nameInput = card.querySelector('input[type="text"]');
            const jumlahInput = card.querySelector('.jumlah-input');
            const hargaInput = card.querySelector('.harga-input');
            const totalCell = card.querySelector('.total-cell');
            const commentInput = card.querySelector('.comment-input-card');
            
            data.push({
                name: nameInput.value,
                jumlah: jumlahInput.value,
                harga: hargaInput.value,
                total: totalCell.textContent,
                comment: commentInput ? commentInput.value : ''
            });
        });
    } else {
        // For desktop view, get data from table
        const rows = itemTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const nameInput = row.querySelector('input[type="text"]');
            const jumlahInput = row.querySelector('.jumlah-input');
            const hargaInput = row.querySelector('.harga-input');
            const totalCell = row.querySelector('.total-cell');
            const commentInput = row.querySelector('.comment-input');
            
            data.push({
                name: nameInput.value,
                jumlah: jumlahInput.value,
                harga: hargaInput.value,
                total: totalCell.textContent,
                comment: commentInput ? commentInput.value : ''
            });
        });
    }
    
    localStorage.setItem('itemData', JSON.stringify(data));
    localStorage.setItem('totalAmount', totalAmount.textContent);
}

// Load data from localStorage
function loadDataFromLocalStorage() {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        const icon = darkModeToggle.querySelector('i');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
    
    // Load item data
    const savedData = localStorage.getItem('itemData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        if (isMobileView) {
            // For mobile view, populate cards
            mobileItemCards.innerHTML = '';
            data.forEach(item => {
                const newCard = document.createElement('div');
                newCard.className = `mobile-card gradient-card fade-in ${isDarkMode ? 'dark-mode' : ''}`;
                newCard.innerHTML = `
                    <div class="mobile-card-header">
                        <h3 class="font-semibold text-gray-800 dark:text-white">Barang</h3>
                        <div class="flex gap-1">
                            <button class="copy-card p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full transition-colors duration-300">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="add-comment-card p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors duration-300">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="delete-card p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors duration-300">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="mobile-card-content">
                        <div class="mobile-card-input">
                            <label class="text-gray-700 dark:text-gray-300">Nama Barang</label>
                            <input type="text" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Nama barang" value="${item.name}">
                        </div>
                        <div class="mobile-card-input">
                            <label class="text-gray-700 dark:text-gray-300">Jumlah</label>
                            <input type="number" min="1" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm jumlah-input" placeholder="0" value="${item.jumlah}">
                        </div>
                        <div class="mobile-card-input">
                            <label class="text-gray-700 dark:text-gray-300">Harga Satuan</label>
                            <input type="number" min="0" step="100" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm harga-input" placeholder="0" value="${item.harga}">
                        </div>
                        <div class="mobile-card-input">
                            <label class="text-gray-700 dark:text-gray-300">Total</label>
                            <div class="p-2 font-medium total-cell text-sm">${item.total}</div>
                        </div>
                        <div class="comment-section-card hidden mt-2">
                            <textarea class="comment-input-card w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Tambahkan catatan..." rows="2"></textarea>
                            <div class="flex justify-end gap-1 mt-1">
                                <button class="save-comment-card px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Simpan</button>
                                <button class="cancel-comment-card px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">Batal</button>
                            </div>
                        </div>
                    </div>
                `;
                mobileItemCards.appendChild(newCard);
            });
            updateMobileEventListeners();
        } else {
            // For desktop view, populate table
            itemTableBody.innerHTML = '';
            data.forEach(item => {
                const newRow = document.createElement('tr');
                newRow.className = 'border-b border-gray-200 fade-in';
                newRow.innerHTML = `
                    <td class="py-3 px-3 sm:px-4">
                        <input type="text" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Nama barang" value="${item.name}">
                    </td>
                    <td class="py-3 px-3 sm:px-4">
                        <input type="number" min="1" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm jumlah-input" placeholder="0" value="${item.jumlah}">
                    </td>
                    <td class="py-3 px-3 sm:px-4">
                        <input type="number" min="0" step="100" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm harga-input" placeholder="0" value="${item.harga}">
                    </td>
                    <td class="py-3 px-3 sm:px-4 font-medium total-cell text-sm">
                        ${item.total}
                    </td>
                    <td class="py-3 px-3 sm:px-4 text-center action-cell">
                        <div class="flex justify-center gap-1">
                            <button class="copy-row p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full transition-colors duration-300">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="add-comment p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors duration-300">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="delete-row p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors duration-300">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div class="comment-section hidden mt-2">
                            <textarea class="comment-input w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Tambahkan catatan..." rows="2"></textarea>
                            <div class="flex justify-end gap-1 mt-1">
                                <button class="save-comment px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Simpan</button>
                                <button class="cancel-comment px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">Batal</button>
                            </div>
                        </div>
                    </td>
                `;
                itemTableBody.appendChild(newRow);
            });
            updateEventListeners();
        }
        
        // Load total amount
        const savedTotal = localStorage.getItem('totalAmount');
            if (savedTotal) {
                totalAmount.textContent = savedTotal;
            }
        }
        
        // Anti-inspection code
        document.addEventListener('contextmenu', event => event.preventDefault());
        
        document.onkeydown = function(e) {
            if (e.keyCode == 123) { // F12
                return false;
            }
            if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { // Ctrl+Shift+I
                return false;
            }
            if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) { // Ctrl+Shift+C
                return false;
            }
            if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { // Ctrl+Shift+J
                return false;
            }
            if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { // Ctrl+U
                return false;
            }
        };

// Share to WhatsApp functionality
const shareBtn = document.getElementById('shareBtn');
const shareModal = document.getElementById('shareModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const sendWaBtn = document.getElementById('sendWaBtn');
const waNumber = document.getElementById('waNumber');
const waMessage = document.getElementById('waMessage');

shareBtn.addEventListener('click', () => {
    let message = '\u{1F4E6} *Data Pecatatan*\n------------------------\n';
    let items = [];

    if (isMobileView) {
        const cards = mobileItemCards.querySelectorAll('.mobile-card');
        cards.forEach((card, index) => {
            const nameInput = card.querySelector('input[type="text"]');
            const jumlahInput = card.querySelector('.jumlah-input');
            const hargaInput = card.querySelector('.harga-input');
            const totalCell = card.querySelector('.total-cell');

            const barang = nameInput.value;
            const jumlah = parseFloat(jumlahInput.value) || 0;
            const harga = parseFloat(hargaInput.value) || 0;
            const total = parseFloat(totalCell.textContent.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;

            message += `No : ${index + 1}\n\u{1F6CD}\u{FE0F} Barang       : ${barang}\n\u{1F522} Jumlah        : ${jumlah}\n\u{1F4B0} Harga Satuan  : Rp ${harga.toLocaleString('id-ID')}\n\u{1F4B5} Total Harga   : Rp ${total.toLocaleString('id-ID')}\n------------------------\n`;
        });
    } else {
        const rows = itemTableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            const nameInput = row.querySelector('input[type="text"]');
            const jumlahInput = row.querySelector('.jumlah-input');
            const hargaInput = row.querySelector('.harga-input');
            const totalCell = row.querySelector('.total-cell');

            const barang = nameInput.value;
            const jumlah = parseFloat(jumlahInput.value) || 0;
            const harga = parseFloat(hargaInput.value) || 0;
            const total = parseFloat(totalCell.textContent.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;

            message += `No : ${index + 1}\n\u{1F6CD}\u{FE0F} Barang       : ${barang}\n\u{1F522} Jumlah        : ${jumlah}\n\u{1F4B0} Harga Satuan  : Rp ${harga.toLocaleString('id-ID')}\n\u{1F4B5} Total Harga   : Rp ${total.toLocaleString('id-ID')}\n------------------------\n`;
        });
    }

    message += `\nTotal Keseluruhan: ${totalAmount.textContent}`;
    message += `\n\nTerima kasih telah berbelanja! \u{1F64F}`;
    waMessage.value = message;
    shareModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    shareModal.classList.add('hidden');
});

sendWaBtn.addEventListener('click', () => {
    let number = waNumber.value.trim();
    if (number.startsWith('08')) {
        number = '62' + number.substring(1);
    }

    if (!number) {
        alert('Nomor WhatsApp harus diisi!');
        return;
    }

    const message = waMessage.value;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    shareModal.classList.add('hidden');
});

// Google Translate
function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: 'id', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
}

const translateBtn = document.getElementById('translateBtn');
translateBtn.addEventListener('click', () => {
    // const googleTranslateElement = document.getElementById('google_translate_element');
    // googleTranslateElement.classList.toggle('hidden');
});

        
        }