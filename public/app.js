class HotelBookingApp {
    constructor() {
        this.currentBookings = [];
        this.currentRooms = [];
        this.availableRoomsCount = 0;
        this.selectedBookingId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRooms();
        this.setMinDates();
    }

    setupEventListeners() {
        document.getElementById('booking-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createBooking();
        });

        document.getElementById('checkin-date').addEventListener('change', () => {
            this.updateCheckoutMinDate();
            this.calculateTotalPrice();
        });

        document.getElementById('checkout-date').addEventListener('change', () => {
            this.calculateTotalPrice();
        });

        document.getElementById('room-select').addEventListener('change', () => {
            this.calculateTotalPrice();
        });

        document.getElementById('booking-form').addEventListener('reset', () => {
            document.getElementById('total-price').textContent = '0';
        });

        document.getElementById('booking-modal').addEventListener('click', (e) => {
            if (e.target.id === 'booking-modal') {
                this.closeModal();
            }
        });
    }

    setMinDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('checkin-date').min = today;
        document.getElementById('checkout-date').min = today;
    }

    updateCheckoutMinDate() {
        const checkinDate = document.getElementById('checkin-date').value;
        if (checkinDate) {
            const minCheckout = new Date(checkinDate);
            minCheckout.setDate(minCheckout.getDate() + 1);
            document.getElementById('checkout-date').min = minCheckout.toISOString().split('T')[0];
        }
    }

    calculateTotalPrice() {
        const roomSelect = document.getElementById('room-select');
        const checkinDate = document.getElementById('checkin-date').value;
        const checkoutDate = document.getElementById('checkout-date').value;

        if (!roomSelect.value || !checkinDate || !checkoutDate) {
            document.getElementById('total-price').textContent = '0';
            return;
        }

        const selectedOption = roomSelect.options[roomSelect.selectedIndex];
        const roomPrice = parseFloat(selectedOption.dataset.price || '0');

        if (!roomPrice) {
            document.getElementById('total-price').textContent = '0';
            return;
        }

        const checkin = new Date(checkinDate);
        const checkout = new Date(checkoutDate);
        const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            document.getElementById('total-price').textContent = '0';
            return;
        }

        const totalPrice = roomPrice * nights;
        document.getElementById('total-price').textContent = totalPrice.toFixed(2);
    }

    async loadRooms() {
        try {
            this.showLoading();
            const response = await fetch('/api/rooms');

            if (!response.ok) {
                throw new Error(`Oops! ${error.message || response.error}`);
            }

            const { rooms, count } = await response.json();
            this.currentRooms = rooms;
            this.availableRoomsCount = count;
            this.displayRooms(rooms);
            this.populateRoomSelect(rooms);
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.showToast('Failed to load rooms', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadBookings() {
        try {
            this.showLoading();
            const response = await fetch('/api/bookings');

            if (!response.ok) {
                throw new Error(`Oops! ${error.message || response.error}`);
            }

            const bookings = await response.json();
            this.currentBookings = bookings;
            this.displayBookings(bookings);
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.showToast('Failed to load bookings', 'error');
        } finally {
            this.hideLoading();
        }
    }

    displayRooms(rooms) {
        const roomsGrid = document.getElementById('rooms-grid');

        if (rooms.length === 0) {
            roomsGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No rooms available</h3>
                    <p>Please check back later or contact our support team.</p>
                </div>
            `;
            return;
        }

        roomsGrid.innerHTML = rooms.map(room => `
            <div class="room-card ${room.isDeluxe ? 'deluxe' : 'standard'}" data-type="${room.isDeluxe ? 'deluxe' : 'standard'}">
                <div class="room-header">
                    <div class="room-number">Room ${room.number}</div>
                    <div class="room-type ${room.isDeluxe ? 'deluxe' : 'standard'}">
                        ${room.isDeluxe ? 'Deluxe' : 'Standard'}
                    </div>
                </div>
                <div class="room-price">$${room.price}/night</div>
                <div class="room-status">
                    <div class="status-indicator ${room.isAvailable ? 'available' : 'unavailable'}"></div>
                    <span>${room.isAvailable ? 'Available' : 'Unavailable'}</span>
                </div>
                <div class="room-actions">
                    ${room.isAvailable ?
                `<button class="btn btn-primary btn-small" onclick="app.selectRoomForBooking('${room.isDeluxe ? 'deluxe' : 'standard'}')">Book Now</button>` :
                `<button class="btn btn-secondary btn-small" disabled>Unavailable</button>`
            }
                    <button class="btn btn-secondary btn-small" onclick="app.viewRoomDetails('${room.id}')">View Details</button>
                </div>
            </div>
        `).join('');
    }

    populateRoomSelect(rooms) {
        const roomSelect = document.getElementById('room-select');
        const availableRooms = rooms.filter(room => room.isAvailable);

        const standardRooms = availableRooms.filter(room => !room.isDeluxe);
        const deluxeRooms = availableRooms.filter(room => room.isDeluxe);

        let options = '<option value="">Choose a room type...</option>';

        if (standardRooms.length > 0) {
            const standardPrice = standardRooms[0].price;
            options += `<option value="standard" data-price="${standardPrice}">Standard Room ($${standardPrice}/night) - ${standardRooms.length} available</option>`;
        }

        if (deluxeRooms.length > 0) {
            const deluxePrice = deluxeRooms[0].price;
            options += `<option value="deluxe" data-price="${deluxePrice}">Deluxe Room ($${deluxePrice}/night) - ${deluxeRooms.length} available</option>`;
        }

        roomSelect.innerHTML = options;
    }

    displayBookings(bookings) {
        const bookingsList = document.getElementById('bookings-list');

        if (bookings.length === 0) {
            bookingsList.innerHTML = `
                <div class="empty-state">
                    <h3>No bookings found</h3>
                    <p>You haven't made any bookings yet. Start by booking a room!</p>
                    <button class="btn btn-primary" onclick="showSection('book')">Make a Booking</button>
                </div>
            `;
            return;
        }

        bookingsList.innerHTML = bookings.map(booking => {
            const checkInDate = new Date(booking.details.checkInDate).toLocaleDateString();
            const checkOutDate = new Date(booking.details.checkOutDate).toLocaleDateString();
            const createdDate = new Date(booking.details.createdAt).toLocaleDateString();

            return `
                <div class="booking-card">
                    <div class="booking-header">
                        <div class="booking-id">Booking #${booking.bookingId.slice(-6)}</div>
                        <div class="booking-status ${booking.status || 'new'}">${(booking.status || 'new').replace('_', ' ')}</div>
                    </div>
                    <div class="booking-details">
                        <div class="booking-detail">
                            <strong>Room:</strong> ${booking.bookingId}
                        </div>
                        <div class="booking-detail">
                            <strong>Check-in:</strong> ${checkInDate}
                        </div>
                        <div class="booking-detail">
                            <strong>Check-out:</strong> ${checkOutDate}
                        </div>
                        <div class="booking-detail">
                            <strong>Total Price:</strong> $${booking.details.totalPrice}
                        </div>
                        <div class="booking-detail">
                            <strong>Created:</strong> ${createdDate}
                        </div>
                    </div>
                    <div class="booking-actions">
                        <button class="btn btn-secondary btn-small" onclick="app.viewBookingDetails('${booking.bookingId}')">View Details</button>
                        ${booking.status !== 'cancelled' && booking.status !== 'checked_out' ?
                    `<button class="btn btn-success btn-small" onclick="app.confirmBooking('${booking.bookingId}')">Confirm</button>
                             <button class="btn btn-danger btn-small" onclick="app.cancelBooking('${booking.bookingId}')">Cancel</button>` :
                    ''
                }
                    </div>
                </div>
            `;
        }).join('');
    }

    async createBooking() {
        try {
            this.showLoading();

            const formData = new FormData(document.getElementById('booking-form'));
            const roomType = formData.get('roomId');

            const bookingData = {
                isDeluxe: roomType === 'deluxe',
                checkIn: formData.get('checkInDate'),
                checkOut: formData.get('checkOutDate'),
                payment: {
                    cardNumber: formData.get('cardNumber'),
                    expiryDate: formData.get('expiryDate'),
                    cvv: formData.get('cvv'),
                    cardHolderName: formData.get('cardHolderName')
                }
            };

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Oops! ${error.message || response.error}`);
            }

            this.showToast('Booking created successfully!', 'success');
            document.getElementById('booking-form').reset();
            document.getElementById('total-price').textContent = '0';

            //ORIGINAl CODE
            // this.loadRooms();
            // this.loadBookings();

            showSection('bookings');
            // this.loadRooms();
            // this.loadBookings();

        } catch (error) {
            console.error('Error creating booking:', error);
            this.showToast(error.message || 'Failed to create booking', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async confirmBooking(bookingId) {
        if (!confirm('Are you sure you want to confirm this booking?')) {
            return;
        }

        try {
            this.showLoading();

            const response = await fetch(`/api/bookings/confirm?id=${bookingId}`, {
                method: 'PUT'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Oops! ${error.message || response.error}`);
            }

            this.showToast('Booking confirmed successfully!', 'success');
            this.loadBookings();
            this.closeModal();

        } catch (error) {
            console.error('Error confirming booking:', error);
            this.showToast(error.message || 'Failed to confirm booking', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading();

            const response = await fetch(`/api/bookings?id=${bookingId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Oops! ${error.message || response.error}`);
            }

            this.showToast('Booking cancelled successfully!', 'success');
            this.loadBookings();
            this.loadRooms();
            this.closeModal();

        } catch (error) {
            console.error('Error cancelling booking:', error);
            this.showToast(error.message || 'Failed to cancel booking', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async viewBookingDetails(bookingId) {
        try {
            this.showLoading();

            const response = await fetch(`/api/booking?id=${bookingId}`);

            if (!response.ok) {
                throw new Error(`Oops! ${error.message || response.error}`);
            }

            const { booking, status } = await response.json();

            this.selectedBookingId = bookingId;
            this.showBookingModal({ ...booking, status });

        } catch (error) {
            console.error('Error loading booking details:', error);
            this.showToast('Failed to load booking details', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async viewRoomDetails(roomId) {
        try {
            this.showLoading();

            const response = await fetch(`/api/room?id=${roomId}`);
            if (!response.ok) {
                throw new Error(`Oops! ${error.message || response.error}`);
            }

            const { room } = await response.json();
            this.showRoomModal(room);

        } catch (error) {
            console.error('Error loading room details:', error);
            this.showToast('Failed to load room details', 'error');
        } finally {
            this.hideLoading();
        }
    }

    showBookingModal(booking) {
        const checkInDate = new Date(booking.checkInDate).toLocaleDateString();
        const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString();
        const createdDate = new Date(booking.createdAt).toLocaleDateString();

        document.getElementById('modal-body').innerHTML = `
            <div class="booking-details">
                <div class="booking-detail">
                    <strong>Booking ID:</strong> ${booking.id}
                </div>
                <div class="booking-detail">
                    <strong>Room ID:</strong> ${booking.roomId}
                </div>
                <div class="booking-detail">
                    <strong>Check-in Date:</strong> ${checkInDate}
                </div>
                <div class="booking-detail">
                    <strong>Check-out Date:</strong> ${checkOutDate}
                </div>
                <div class="booking-detail">
                    <strong>Total Price:</strong> $${booking.totalPrice}
                </div>
                <div class="booking-detail">
                    <strong>Status:</strong> <span class="booking-status ${booking.status || 'new'}">${(booking.status || 'new').replace('_', ' ')}</span>
                </div>
                <div class="booking-detail">
                    <strong>Created:</strong> ${createdDate}
                </div>
            </div>
        `;

        const confirmBtn = document.getElementById('confirm-booking-btn');
        const cancelBtn = document.getElementById('cancel-booking-btn');

        if (booking.status === 'cancelled' || booking.status === 'checked_out') {
            confirmBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
        } else {
            confirmBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
        }

        document.getElementById('booking-modal').classList.add('show');
    }

    showRoomModal(room) {
        document.getElementById('modal-body').innerHTML = `
            <div class="room-details">
                <div class="room-detail">
                    <strong>Room Number:</strong> ${room.number}
                </div>
                <div class="room-detail">
                    <strong>Type:</strong> <span class="room-type ${room.isDeluxe ? 'deluxe' : 'standard'}">${room.isDeluxe ? 'Deluxe' : 'Standard'}</span>
                </div>
                <div class="room-detail">
                    <strong>Price per Night:</strong> $${room.price}
                </div>
                <div class="room-detail">
                    <strong>Availability:</strong> 
                    <span class="room-status">
                        <span class="status-indicator ${room.isAvailable ? 'available' : 'unavailable'}"></span>
                        ${room.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                </div>
                ${room.isDeluxe ? `
                    <div class="room-detail">
                        <strong>Features:</strong> Premium amenities, enhanced comfort, luxury furnishing
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('confirm-booking-btn').style.display = 'none';
        document.getElementById('cancel-booking-btn').style.display = 'none';

        document.getElementById('booking-modal').classList.add('show');
    }

    selectRoomForBooking(roomType) {
        document.getElementById('room-select').value = roomType;
        this.calculateTotalPrice();
        showSection('book');
        this.showToast('Room type selected! Please complete your booking details.', 'success');
    }

    closeModal() {
        document.getElementById('booking-modal').classList.remove('show');
        this.selectedBookingId = null;
    }

    showLoading() {
        document.getElementById('loading').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loading').classList.remove('show');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');

        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${sectionId}-section`).classList.add('active');
    document.getElementById(sectionId).classList.add('active');

    if (sectionId === 'bookings') {
        app.loadBookings();
    } else if (sectionId === 'rooms') {
        app.loadRooms();
    }
}

function filterRooms(type) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    event.target.classList.add('active');

    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach(card => {
        if (type === 'all' || card.dataset.type === type) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function loadBookings() {
    app.loadBookings();
}

function closeModal() {
    app.closeModal();
}

function confirmBooking() {
    if (app.selectedBookingId) {
        app.confirmBooking(app.selectedBookingId);
    }
}

function cancelBooking() {
    if (app.selectedBookingId) {
        app.cancelBooking(app.selectedBookingId);
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new HotelBookingApp();
});
