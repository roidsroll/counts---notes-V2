document.addEventListener('DOMContentLoaded', function() {
    // Splash screen logic
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 2000);
    }

    // DOM Elements for Event Modal
    const eventModal = document.getElementById('eventModal');
    const eventModalContent = document.getElementById('eventModalContent');
    const modalTitle = document.getElementById('modalTitle');
    const eventTitleInput = document.getElementById('eventTitleInput');
    const eventDateInput = document.getElementById('eventDateInput');
    const eventDescriptionInput = document.getElementById('eventDescriptionInput');
    const cancelEventBtn = document.getElementById('cancelEventBtn');
    const saveEventBtn = document.getElementById('saveEventBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn'); // Added

    let calendar;
    let events = []; // Array to store events
    let editingEventId = null; // To track which event is being edited

    // --- Local Storage Management ---
    function saveEventsToLocalStorage() {
        localStorage.setItem('schedulerEvents', JSON.stringify(events));
    }

    function loadEventsFromLocalStorage() {
        const savedEvents = localStorage.getItem('schedulerEvents');
        if (savedEvents) {
            events = JSON.parse(savedEvents);
        }
    }

    // --- Event Modal Functions ---
    function openEventModal(title = '', date = '', description = '', isNewEvent = true) {
        modalTitle.textContent = isNewEvent ? 'Tambah Event Baru' : 'Edit Event';
        eventTitleInput.value = title;
        eventDateInput.value = date;
        eventDescriptionInput.value = description;
        
        eventModal.classList.remove('hidden');
        setTimeout(() => {
            eventModalContent.classList.remove('opacity-0', 'scale-95');
            eventModalContent.classList.add('opacity-100', 'scale-100');
        }, 10);
    }

    function closeEventModal() {
        eventModalContent.classList.remove('opacity-100', 'scale-100');
        eventModalContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            eventModal.classList.add('hidden');
            eventTitleInput.value = '';
            eventDateInput.value = '';
            eventDescriptionInput.value = '';
            editingEventId = null;
        }, 300);
    }

    function saveEvent() {
        const title = eventTitleInput.value.trim();
        const date = eventDateInput.value;
        const description = eventDescriptionInput.value.trim();

        if (!title || !date) {
            alert('Judul dan Tanggal Event tidak boleh kosong!');
            return;
        }

        if (editingEventId) {
            // Update existing event in FullCalendar
            let calendarEvent = calendar.getEventById(editingEventId);
            if (calendarEvent) {
                calendarEvent.setProp('title', title);
                calendarEvent.setStart(date);
                calendarEvent.setExtendedProp('description', description);
            }
            // Also update in our local 'events' array for persistence
            events = events.map(event =>
                event.id === editingEventId ? { ...event, title, start: date, description } : event
            );
        } else {
            // Add new event to FullCalendar
            const newEvent = {
                id: String(Date.now()), // Simple unique ID
                title,
                start: date,
                description,
                allDay: true // Assuming all events are all-day for simplicity
            };
            calendar.addEvent(newEvent); // Add to FullCalendar
            events.push(newEvent); // Add to our local 'events' array for persistence
        }
        
        saveEventsToLocalStorage(); // Save the updated 'events' array
        closeEventModal();
    }

    // --- PDF Export Function ---
    function downloadPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFont("helvetica");
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text("Agenda Event Kalender", 105, 20, null, null, "center");

        const today = new Date();
        const dateStr = today.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        doc.setFontSize(12);
        doc.text(`Tanggal Cetak: ${dateStr}`, 105, 30, null, null, "center");
        doc.line(20, 35, 190, 35);

        let yPosition = 45;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("DAFTAR EVENT:", 20, yPosition);
        yPosition += 10;

        doc.setFont("helvetica", "normal");

        if (events.length > 0) {
            // Sort events by date
            const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));

            sortedEvents.forEach((event, index) => {
                if (yPosition > 270) { // Check for new page
                    doc.addPage();
                    yPosition = 20;
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.text("DAFTAR EVENT (Lanjutan):", 20, yPosition);
                    yPosition += 10;
                    doc.setFont("helvetica", "normal");
                }

                const eventDate = new Date(event.start).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });

                doc.text(`${index + 1}. ${eventDate} - ${event.title}`, 20, yPosition);
                if (event.description) {
                    const descriptionLines = doc.splitTextToSize(`Deskripsi: ${event.description}`, 170); // Max width 170
                    yPosition += 7;
                    doc.text(descriptionLines, 25, yPosition);
                    yPosition += (descriptionLines.length - 1) * 7;
                }
                yPosition += 10; // Spacing for next event
            });
        } else {
            doc.text("Tidak ada event yang dijadwalkan.", 20, yPosition);
        }

        doc.save('daftar-event-scheduler.pdf');
    }

    // --- FullCalendar Initialization ---
    loadEventsFromLocalStorage(); // Load events before initializing calendar

    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        firstDay: 1, // Start week on Monday
        locale: 'id', // Set locale to Indonesian
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        editable: true, // Allow events to be dragged and resized
        selectable: true, // Allow date selection
        selectMirror: true,
        dayMaxEvents: true, // Allow "more" link when too many events
        events: events, // Load events from our array

        dateClick: function(info) {
            const clickedDate = new Date(info.dateStr);
            const today = calendar.getDate(); // Get the calendar's current date, not today's actual date
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const clickedMonth = clickedDate.getMonth();
            const clickedYear = clickedDate.getFullYear();

            // Allow clicking only if the clicked date is in the current month of the calendar view
            if (clickedYear !== currentYear || clickedMonth !== currentMonth) {
                alert('Tidak dapat menambahkan event di luar bulan yang sedang dilihat.');
                return; // Prevent modal from opening
            }

            editingEventId = null; // Ensure new event
            openEventModal('', info.dateStr, '', true);
        },
        eventClick: function(info) {
            editingEventId = info.event.id;
            openEventModal(info.event.title, info.event.startStr, info.event.extendedProps.description, false);
        },
        eventDrop: function(info) {
            // Update event date when dragged
            const droppedEvent = events.find(event => event.id === info.event.id);
            if (droppedEvent) {
                droppedEvent.start = info.event.startStr;
                saveEventsToLocalStorage();
            }
        },
        eventResize: function(info) {
            // Update event end date when resized (if using end dates)
            // For simplicity, current events are allDay, so resize isn't very relevant here.
            // If you add end dates, update them here.
        },
        eventContent: function(arg) {
            // Customize event display if needed
            return { html: `<b>${arg.timeText}</b> <i>${arg.event.title}</i>` };
        },
        // Custom button for adding event (if needed outside of dateClick)
        // customButtons: {
        //     addEventButton: {
        //         text: 'Tambah Event',
        //         click: function() {
        //             editingEventId = null;
        //             openEventModal('', '', '', true);
        //         }
        //     }
        // }
    });
    calendar.render();

    // --- Event Listeners for Modal ---
    cancelEventBtn.addEventListener('click', closeEventModal);
    saveEventBtn.addEventListener('click', saveEvent);
    if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', downloadPdf); // Added Event Listener for PDF button

    // Close modal when clicking outside of it
    eventModal.addEventListener('click', function(event) {
        if (event.target === eventModal) {
            closeEventModal();
        }
    });
});
