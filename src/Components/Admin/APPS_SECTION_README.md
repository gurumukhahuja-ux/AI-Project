# Admin Dashboard: Apps Section (Agent Management)

The **Apps** section (internally referred to as `AgentManagement`) is a core component of the Admin Dashboard designed to manage the lifecycle of AI Agents within the marketplace.

## Key Features

- **App Inventory**: A comprehensive list of all agents registered in the system.
- **Real-Time Data**: Directly connected to the backend to show live status (Live, Inactive) and reviews status (Draft, Pending Review, Approved).
- **Creation Workflow**: Admins can create new apps using the `CreateAppModal`.
- **App Details View**: Clicking on an app opens the `AppDetails` component for deep-dive inspection and status management (e.g., forcing an app to go "Live").

## Technical Implementation & Responsiveness

To ensure a premium and sleek experience on all devices, the Apps section implements a **Dual-Layout Strategy**:

### 1. Adaptive Data Display
- **Desktop (>= 768px)**: Uses a structured `<table>` for high-density information display, including detailed columns for Pricing, Status, and ID.
- **Mobile (< 768px)**: Automatically switches to a **Card-Based Layout**. Each app is represented as a standalone card with a vertical stack for details, making it easy to tap and read on smaller screens.

### 2. Interaction Model
- **Click-to-Expand**: Both cards and table rows are interactive, leading to the full details view.
- **Quick Actions**: Hover-based quick actions on desktop (Edit/Hide) are always visible on mobile cards for better accessibility.

### 3. Integrated Components
| Component | Responsibility |
|-----------|----------------|
| `AgentManagement.jsx` | Container & Layout Manager (Tabs vs Cards) |
| `AppDetails.jsx` | Deep-level management and approval controls |
| `CreateAppModal.jsx` | Forms for registering new marketplace agents |

## Recent Enhancements
- **Mobile First**: Implemented a dedicated card-view for mobile users.
- **Performance**: Integrated with real-time backend statistics for "Active Agents" and "Pending Approvals".
- **UX Polish**: Added glassmorphism effects and smooth transitions (Lucide icons) to provide a high-end "Pro" dashboard feel.
