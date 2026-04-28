import { Wheel } from 'https://cdn.jsdelivr.net/npm/spin-wheel@5.0.2/dist/spin-wheel-esm.js';

document.addEventListener('DOMContentLoaded', function() {
    // Splash screen logic
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 2000);
    }

    // DOM Elements
    const lotteryWheelEl = document.getElementById('lotteryWheel');
    const entriesInput = document.getElementById('entriesInput');
    const updateWheelButton = document.getElementById('updateWheelButton');
    const clearEntriesButton = document.getElementById('clearEntriesButton');
    const spinButton = document.getElementById('spinButton');
    const winnerDisplay = document.getElementById('winnerDisplay');
    const winnerName = document.getElementById('winnerName');
    const currentEntriesList = document.getElementById('currentEntriesList');
    const emptyEntriesMessage = document.getElementById('emptyEntriesMessage');

    let spinWheel;
    let entries = []; // Array of { label: string } objects for spin-wheel

    // --- Local Storage Management ---
    function saveEntriesToLocalStorage() {
        localStorage.setItem('lotteryEntries', JSON.stringify(entries.map(e => e.label)));
    }

    function loadEntriesFromLocalStorage() {
        const savedEntries = localStorage.getItem('lotteryEntries');
        if (savedEntries) {
            entries = JSON.parse(savedEntries).map(label => ({ label }));
            entriesInput.value = entries.map(e => e.label).join('\n'); // Populate textarea
            renderEntriesList();
        } else {
            // Default entries if none saved
            entries = [
                { label: 'Peserta 1' },
                { label: 'Peserta 2' },
                { label: 'Peserta 3' },
                { label: 'Peserta 4' }
            ];
            entriesInput.value = entries.map(e => e.label).join('\n');
            saveEntriesToLocalStorage();
            renderEntriesList();
        }
        updateSpinWheelItems();
    }

    // --- Entry List Rendering ---
    function renderEntriesList() {
        currentEntriesList.innerHTML = '';
        if (entries.length === 0) {
            emptyEntriesMessage.classList.remove('hidden');
        } else {
            emptyEntriesMessage.classList.add('hidden');
            entries.forEach(entry => {
                const listItem = document.createElement('div');
                listItem.className = 'entries-list-item text-gray-800 text-sm';
                listItem.textContent = entry.label;
                currentEntriesList.appendChild(listItem);
            });
        }
    }

    // --- Spin Wheel Initialization & Management ---
    function updateSpinWheelItems() {
        // Ensure that there are entries before trying to initialize or update the wheel
        if (entries.length === 0) {
            // If no entries, ensure spinButton is disabled and winner display is hidden
            spinButton.disabled = true;
            spinButton.classList.add('opacity-50', 'cursor-not-allowed');
            winnerDisplay.classList.add('hidden');
            if (spinWheel) {
                spinWheel.items = []; // Clear items from the wheel
                spinWheel.draw();
            }
            return;
        } else {
            spinButton.disabled = false;
            spinButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        if (!spinWheel) {
            // Initialize SpinWheel if it doesn't exist
            spinWheel = new Wheel(lotteryWheelEl, {
                items: entries,
                itemLabelFontSizeMax: 20,
                itemLabelColors: ['#ffffff'], // White text for all labels
                itemLabelAlign: 'center',
                itemLabelRotation: 0, // Keep text horizontal
                // Removed image paths to avoid potential CDN issues
                onRest: onSpinRest,
            });
            // Overriding colors for segments
            const segmentColors = ['#000000', '#333333', '#666666', '#999999']; 
            spinWheel.items.forEach((item, index) => {
                item.backgroundColor = segmentColors[index % segmentColors.length];
            });
            spinWheel.draw(); 
        } else {
            // Update items if SpinWheel already initialized
            // Directly assign the new entries array to spinWheel.items
            // Ensure proper deep copy or update if the library does not handle reference changes well
            spinWheel.items = entries.map(item => ({ ...item })); // Create new item objects
            const segmentColors = ['#000000', '#333333', '#666666', '#999999']; 
            spinWheel.items.forEach((item, index) => {
                item.backgroundColor = segmentColors[index % segmentColors.length];
                // Label is already updated via entries.map(label => ({ label }))
            });
            spinWheel.draw();
        }
    }

    function onSpinRest(event) {
        spinButton.disabled = false;
        spinButton.classList.remove('opacity-50', 'cursor-not-allowed');
        winnerName.textContent = event.selectedItem.label;
        winnerDisplay.classList.remove('hidden');
    }

    function spinTheWheel() {
        if (entries.length === 0) {
            alert('Silakan masukkan peserta terlebih dahulu!');
            return;
        }
        spinButton.disabled = true;
        spinButton.classList.add('opacity-50', 'cursor-not-allowed');
        winnerDisplay.classList.add('hidden');
        spinWheel.spin();
    }

    function processEntriesInput() {
        const inputLines = entriesInput.value.split('\n').map(line => line.trim()).filter(line => line !== '');
        entries = inputLines.map(label => ({ label }));
        saveEntriesToLocalStorage();
        renderEntriesList();
        updateSpinWheelItems();
    }

    function clearAllEntries() {
        if (confirm('Apakah Anda yakin ingin menghapus semua peserta?')) {
            entries = [];
            entriesInput.value = '';
            saveEntriesToLocalStorage();
            renderEntriesList();
            updateSpinWheelItems();
            winnerDisplay.classList.add('hidden');
        }
    }

    // --- Event Listeners ---
    updateWheelButton.addEventListener('click', processEntriesInput);
    clearEntriesButton.addEventListener('click', clearAllEntries);
    spinButton.addEventListener('click', spinTheWheel);

    // Initial load
    loadEntriesFromLocalStorage();
    updateSpinWheelItems(); // Call after loading entries
});
