let editorInstance; // To store the CKEditor instance

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const addNoteBtn = document.getElementById('addNoteBtn');
    const noteModal = document.getElementById('noteModal');
    const noteModalContent = document.getElementById('noteModalContent');
    const cancelNoteBtn = document.getElementById('cancelNoteBtn');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const noteTitleInput = document.getElementById('noteTitleInput');
    const notesList = document.getElementById('notesList');
    const addNoteBtnContainer = document.getElementById('addNoteBtnContainer'); // New
    const floatingAddNoteBtn = document.getElementById('floatingAddNoteBtn'); // New

    // Splash screen logic
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
                }, 2000);
            }
        
            let notes = []; // Array to store notes
            let editingNoteId = null; // To track which note is being edited
        
            // --- CKEditor 5 Initialization ---
    function initializeCKEditor() {
        if (!editorInstance) { // Initialize only if not already initialized
            ClassicEditor
                .create(document.querySelector('#editor'), {
                    toolbar: {
                        items: [
                            'heading', '|',
                            'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
                            'uploadImage', // Add image upload button to toolbar
                            'undo', 'redo'
                        ]
                    },
                    language: 'en'
                })
                .then(editor => {
                    editorInstance = editor;
                })
                .catch(error => {
                    console.error('There was an error initializing the editor.', error);
                });
        }
    }

    // --- Note Management Logic ---
    function saveNotesToLocalStorage() {
        localStorage.setItem('notesData', JSON.stringify(notes));
    }

    function loadNotesFromLocalStorage() {
        const savedNotes = localStorage.getItem('notesData');
        if (savedNotes) {
            notes = JSON.parse(savedNotes);
            renderNotes();
        }
    }

    function renderNotes() {
        notesList.innerHTML = ''; // Clear current notes
        if (notes.length === 0) {
            notesList.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400">Tidak ada catatan. Klik "Tambahkan Catatan" untuk memulai!</p>`;
            addNoteBtnContainer.classList.remove('hidden');
            floatingAddNoteBtn.classList.add('hidden');
        } else {
            addNoteBtnContainer.classList.add('hidden');
            floatingAddNoteBtn.classList.remove('hidden');
        }

        notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest first

        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = `bg-white border border-gray-300 rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl`;
            noteCard.innerHTML = `
                <h3 class="text-xl font-bold text-gray-900 mb-2">${note.title}</h3>
                <div class="text-gray-800 text-sm mb-3 cked-content ck-content">
                    ${note.content}
                </div>
                <div class="text-xs text-gray-600 mb-4">${new Date(note.timestamp).toLocaleString()}</div>
                <div class="flex justify-end gap-2">
                    <button class="edit-note-btn p-2 bg-black text-white hover:bg-gray-800 rounded-full transition-colors duration-300" data-id="${note.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-note-btn p-2 bg-black text-white hover:bg-gray-800 rounded-full transition-colors duration-300" data-id="${note.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            notesList.appendChild(noteCard);
        });
        addNoteCardEventListeners();
    }

    function addNoteCardEventListeners() {
        document.querySelectorAll('.edit-note-btn').forEach(button => {
            button.addEventListener('click', (event) => editNote(event.currentTarget.dataset.id));
        });
        document.querySelectorAll('.delete-note-btn').forEach(button => {
            button.addEventListener('click', (event) => deleteNote(event.currentTarget.dataset.id));
        });
        // TODO: Add event listener for "Baca Selengkapnya" to show full note content (perhaps in a read-only modal)
    }

    function openNoteModal(title = '', content = '') {
        noteTitleInput.value = title;
        if (editorInstance) {
            editorInstance.setData(content);
        } else {
            // Fallback if editor not yet initialized (shouldn't happen if called after init)
            document.querySelector('#editor').value = content;
        }
        noteModal.classList.remove('hidden');
        // Add animation classes
        setTimeout(() => {
            noteModalContent.classList.remove('opacity-0', 'scale-95');
            noteModalContent.classList.add('opacity-100', 'scale-100');
        }, 10); // Small delay for CSS transition to work
    }

    function closeNoteModal() {
        noteModalContent.classList.remove('opacity-100', 'scale-100');
        noteModalContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            noteModal.classList.add('hidden');
            noteTitleInput.value = '';
            if (editorInstance) {
                editorInstance.setData('');
            }
            editingNoteId = null; // Reset editing state
        }, 300); // Wait for animation to finish
    }

    function addNote() {
        editingNoteId = null; // Ensure we are adding a new note
        document.getElementById('modalTitle').textContent = 'Tambah Catatan Baru';
        openNoteModal();
    }

    function editNote(id) {
        const noteToEdit = notes.find(note => note.id === id);
        if (noteToEdit) {
            editingNoteId = id;
            document.getElementById('modalTitle').textContent = 'Edit Catatan';
            openNoteModal(noteToEdit.title, noteToEdit.content);
        }
    }

    function deleteNote(id) {
        if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
            notes = notes.filter(note => note.id !== id);
            saveNotesToLocalStorage();
            renderNotes();
        }
    }

    function saveNote() {
        const title = noteTitleInput.value.trim();
        const content = editorInstance ? editorInstance.getData().trim() : '';

        if (!title || !content) {
            alert('Judul dan isi catatan tidak boleh kosong!');
            return;
        }

        if (editingNoteId) {
            // Update existing note
            notes = notes.map(note =>
                note.id === editingNoteId ? { ...note, title, content, timestamp: new Date().toISOString() } : note
            );
        } else {
            // Add new note
            const newNote = {
                id: crypto.randomUUID(), // Generate a unique ID
                title,
                content,
                timestamp: new Date().toISOString()
            };
            notes.push(newNote);
        }

        saveNotesToLocalStorage();
        renderNotes();
        closeNoteModal();
    }

    // --- Event Listeners ---
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', addNote);
    }
    if (floatingAddNoteBtn) {
        floatingAddNoteBtn.addEventListener('click', addNote);
    }
    if (cancelNoteBtn) {
        cancelNoteBtn.addEventListener('click', closeNoteModal);
    }
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', saveNote);
    }

    // Close modal when clicking outside of it
    noteModal.addEventListener('click', function(event) {
        if (event.target === noteModal) {
            closeNoteModal();
        }
    });

    // Initialize CKEditor when the modal is about to be shown for the first time
    // Or, more reliably, right after DOM content is loaded.
    initializeCKEditor();
    loadNotesFromLocalStorage(); // Load and render notes on page load
});
