# ThreatNexus by Deepak 🛡️

**One Search. Unified Threat Intelligence.**

ThreatNexus is a high-performance, multi-vector Indicator of Compromise (IOC) investigation platform. It aggregates threat intelligence from top-tier security engines (VirusTotal and AlienVault OTX) into a single, highly interactive, and visually stunning Cyber-themed dashboard.

## 🚀 Features

- **Multi-Vector Analysis:** Scan IPv4/IPv6 addresses, Domains, URLs, and File Hashes (MD5/SHA256).
- **Asynchronous Aggregation:** Powered by FastAPI and `httpx` to concurrently fetch threat telemetry in real-time.
- **Smart Risk Engine:** Custom algorithm that calculates a 0-100 threat score and assigns severity levels based on engine detections and community pulses.
- **Advanced Cyber UI:** A premium, dark-mode neon graphical interface built with React, Vite, and Tailwind CSS v4 featuring glassmorphism and glowing components.
- **Human-Readable Data:** Automatically translates complex JSON payloads and Unix timestamps into easily understandable metrics.
- **CSV Export:** Download full investigation reports instantly.

## 🛠️ Tech Stack

**Backend:**
- Python 3.12+
- FastAPI & Uvicorn (ASGI)
- SQLAlchemy (Async) & SQLite
- Pydantic

**Frontend:**
- React 18 + Vite
- TypeScript
- Tailwind CSS v4
- Lucide React (Icons)

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/threat-nexus.git
cd threat-nexus
```

### 2. Backend Configuration
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows
pip install -r requirements.txt
```
Create a `.env` file in the root directory and add your API keys:
```env
VIRUSTOTAL_API_KEY=your_key_here
ALIENVAULT_OTX_API_KEY=your_key_here
```
Run the server:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Frontend Configuration
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000` in your browser to launch ThreatNexus.

## 🤝 Contribution
Designed and engineered by **Deepak**. 