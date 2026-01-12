# Smart Parking System

A modern, mobile-first Smart Parking System web application built with Next.js, React.js, Tailwind CSS, and Express.js. The app streamlines valet parking operations with role-based dashboards for users, drivers, managers, and super admins.

### Key Flows
- **User Flow**: Scan QR code → Select vehicle → Confirm parking details → Receive digital ticket → Track vehicle retrieval
- **Driver Flow**: Receive assignments → Park vehicles → Retrieve vehicles with progress updates
- **Manager Flow**: Monitor operations → Manage assignments → Communicate with valets
- **Super Admin Flow**: Manage multiple sites → View performance metrics → Handle administrative tasks

## 🚀 Features

### User Application
- **Home Screen**: View recent parking history and quick access to scan QR
- **QR Scanner**: Mock QR code scanning to select parking location
- **Vehicle Selection**: Choose from saved vehicles or register new ones
- **Parking Confirmation**: Review vehicle and location details, select payment method
- **Digital Ticket**: View parking ticket with QR code, download and share options
- **Vehicle Retrieval**: Real-time progress tracking for car retrieval
- **Parking History**: View all completed parking sessions
- **Settings**: Manage profile, vehicles, and preferences

### Driver Console
- **Dashboard**: View current and new assignments
- **Park Assignment**: Handle vehicle parking tasks
- **Retrieve Assignment**: Manage vehicle retrieval with progress tracking
- **Daily Stats**: Track today's parked and retrieved vehicles

### Manager Dashboard
- **Operations Overview**: Monitor active cars, retrieving status, and revenue
- **Assignment Management**: View and manage all valet assignments
- **Valet Communication**: Call or reassign valets
- **Search & Filter**: Find assignments by plate, customer, or valet

### Super Admin Dashboard
- **Multi-Site Management**: Switch between different parking locations
- **Today's Performance**: Track tickets issued and collection
- **Overall Statistics**: View total tickets, collection, and active parking
- **Quick Actions**: Access reports, manage sites, staff, and approvals

## Run

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation and Running

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rajatrsrivastav/smart-parking-system.git
   cd smart-parking-system
   ```

2. **Setup the server**:
   ```bash
   cd server
   npm install
   npm start
   ```
   The server will run on `http://localhost:3001` (or as configured).

3. **Setup the client** (in a new terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The client will run on `http://localhost:3000`.

4. Open your browser and navigate to `http://localhost:3000` to access the application.

## Screenshots/Demo

### Demo Video
<video width="640" height="360" controls>
  <source src="demo/demo-video.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>


