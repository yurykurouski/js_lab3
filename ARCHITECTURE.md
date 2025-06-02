# UML Diagrams for Hotel Booking System

## State Pattern - Booking State Diagram

```mermaid
stateDiagram-v2
    [*] --> NEW : create booking
    NEW --> CONFIRMED : confirm()
    NEW --> CANCELLED : cancel()
    CONFIRMED --> CHECKED_IN : checkIn()
    CONFIRMED --> CANCELLED : cancel()
    CHECKED_IN --> CHECKED_OUT : checkOut()
    CHECKED_OUT --> [*]
    CANCELLED --> [*]
    
    NEW : Available Actions: confirm, cancel
    CONFIRMED : Available Actions: checkIn, cancel
    CHECKED_IN : Available Actions: checkOut
    CHECKED_OUT : Available Actions: none
    CANCELLED : Available Actions: none
```

## Facade Pattern - Class Diagram

```mermaid
classDiagram
    class HotelBookingFacade {
        -guestService: GuestService
        -roomService: RoomService
        -paymentService: PaymentService
        -notificationService: NotificationService
        -bookingService: BookingService
        +bookRoom(guest, roomType, checkIn, checkOut, payment) Result
        +confirmBooking(bookingId) Result
        +cancelBooking(bookingId) Result
        +checkIn(bookingId) Result
        +checkOut(bookingId) Result
        +getBookingInfo(bookingId) BookingInfo
        +getAvailableRooms() Room[]
    }
    
    class GuestService {
        -guests: Map~string, Guest~
        +registerGuest(guest) void
        +getGuest(id) Guest
        +validateGuest(id) boolean
    }
    
    class RoomService {
        -rooms: Map~string, Room~
        +getAvailableRooms() Room[]
        +getRoom(id) Room
        +reserveRoom(roomId) boolean
        +releaseRoom(roomId) void
        +getRoomsByType(type) Room[]
    }
    
    class PaymentService {
        +processPayment(amount, cardNumber) boolean
        +refundPayment(amount, bookingId) boolean
    }
    
    class NotificationService {
        +sendBookingConfirmation(email, bookingId) void
        +sendCancellationNotice(email, bookingId) void
        +sendCheckInReminder(email, bookingId) void
        +sendReceiptEmail(email, amount) void
    }
    
    class BookingService {
        -bookings: Map~string, Booking~
        -bookingCounter: number
        +createBooking(details) Booking
        +getBooking(bookingId) Booking
        +getAllBookings() Booking[]
        +deleteBooking(bookingId) boolean
        +generateBookingId() string
        +getBookingsByGuest(guestId) Booking[]
        +getBookingsByRoom(roomId) Booking[]
        +hasActiveBookings(roomId) boolean
    }
    
    class Booking {
        -state: BookingState
        -details: BookingDetails
        +setState(state) void
        +getState() BookingState
        +confirm() void
        +checkIn() void
        +checkOut() void
        +cancel() void
        +getAvailableActions() string[]
    }
    
    class BookingState {
        <<abstract>>
        +getStatus() BookingStatus
        +getAvailableActions() string[]
        +confirm(booking) void
        +checkIn(booking) void
        +checkOut(booking) void
        +cancel(booking) void
    }
    
    class NewBookingState {
        +getStatus() BookingStatus
        +confirm(booking) void
        +cancel(booking) void
    }
    
    class ConfirmedBookingState {
        +getStatus() BookingStatus
        +checkIn(booking) void
        +cancel(booking) void
    }
    
    class CheckedInBookingState {
        +getStatus() BookingStatus
        +checkOut(booking) void
    }
    
    class CheckedOutBookingState {
        +getStatus() BookingStatus
    }
    
    class CancelledBookingState {
        +getStatus() BookingStatus
    }
    
    HotelBookingFacade --> GuestService
    HotelBookingFacade --> RoomService
    HotelBookingFacade --> PaymentService
    HotelBookingFacade --> NotificationService
    HotelBookingFacade --> BookingService
    BookingService --> Booking
    Booking --> BookingState
    BookingState <|-- NewBookingState
    BookingState <|-- ConfirmedBookingState
    BookingState <|-- CheckedInBookingState
    BookingState <|-- CheckedOutBookingState
    BookingState <|-- CancelledBookingState
```

## System Architecture Overview

```mermaid
graph TB
    Client[Client Code] --> Facade[HotelBookingFacade]
    
    Facade --> GS[GuestService]
    Facade --> RS[RoomService]
    Facade --> PS[PaymentService]
    Facade --> NS[NotificationService]
    Facade --> BS[BookingService]
    BS --> Booking[Booking Context]
    Facade --> NS[NotificationService]
    Facade --> Booking[Booking Context]
    
    Booking --> State[BookingState]
    State --> New[NewBookingState]
    State --> Confirmed[ConfirmedBookingState]
    State --> CheckedIn[CheckedInBookingState]
    State --> CheckedOut[CheckedOutBookingState]
    State --> Cancelled[CancelledBookingState]
    
    subgraph "Facade Pattern"
        Facade
        GS
        RS
        PS
        NS
        BS
    end
    
    subgraph "State Pattern"
        Booking
        State
        New
        Confirmed
        CheckedIn
        CheckedOut
        Cancelled
    end
```

## Pattern Benefits

### Facade Pattern Benefits:
- **Simplification**: Complex booking process simplified to single method calls
- **Encapsulation**: Internal service complexity hidden from clients
- **Loose Coupling**: Client depends only on facade, not individual services
- **Centralized Control**: Single point for booking operations

### State Pattern Benefits:
- **State Management**: Clear state transitions and available actions
- **Error Prevention**: Invalid operations automatically blocked
- **Maintainability**: Easy to add new states or modify transitions
- **Code Organization**: State-specific behavior encapsulated in state classes
