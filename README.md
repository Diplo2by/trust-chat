
# Trust Chat

A lightweight, real-time messaging app for secure and instant communication. Built with modern web technologies and a focus on simplicity and speed.

---

## Features

- Real-time messaging between authenticated users
- Friend system to connect with approved users
- Internet connectivity detection with user-friendly alerts
- Push notifications for incoming messages
- Message timestamps for improved clarity
- Refreshed UI with modern styling and improved responsiveness
- Secure authentication via Supabase

---

## Tech Stack

- Frontend: React + TypeScript  
- Backend: Supabase (Auth + Realtime DB)  
- Styling: Tailwind CSS + Shadcn/ui  
- Packaging: Tauri/Rust + AppImage / DEB / RPM / Windows Installer

---

## Installation

Visit the [Releases](https://github.com/Diplo2by/trust-chat/releases) page to download the latest installer for your operating system (Windows or Linux). Follow the installation instructions specific to your platform.

---

## Limitations

- No group chats (coming soon)
- 100-message limit per conversation
- Basic notifications without user settings

---

## Coming Soon

- Message search  
- Group chat support  
- Profile customization  
- Message formatting, editing, and deletion  
- Notification controls

---

## Development

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

### Get Started

```bash
# Clone the repo
git clone https://github.com/Diplo2by/trust-chat.git
cd trust-chat

# Install dependencies
npm install

# Start the dev server
npm run tauri dev
```

---
