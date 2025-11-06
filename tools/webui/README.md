# KETI TSN Traffic Tester - Web UI

Professional web-based traffic generation and monitoring tool for Time-Sensitive Networking (TSN) performance testing.

## Features

- **Dual Mode Operation**: Generator and Listener modes
- **Multiple Test Types**:
  - iperf3 TCP/UDP throughput testing
  - sockperf ping-pong latency testing
  - sockperf under-load testing
  - ICMP ping connectivity testing
- **Real-time Visualization**: Live charts with Chart.js
- **Professional UI**: KETI-branded interface with blue accent design
- **WebSocket Communication**: Real-time bidirectional data flow
- **Data Export**: Export results in JSON/CSV format

## Quick Start

```bash
cd tools/webui
./start.sh
```

Open your browser to http://localhost:9000

## Requirements

- Python 3.8+
- FastAPI, uvicorn, websockets
- iperf3 (for throughput testing)
- sockperf (for latency testing)

## Installation

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install python3 python3-pip iperf3 sockperf
pip3 install --user fastapi uvicorn websockets
```

### Manual Start
```bash
python3 app.py --host 0.0.0.0 --port 9000
```

## Usage

### Generator Mode
1. Configure remote IP and interface
2. Select test type (iperf3, sockperf, ping)
3. Set test parameters (duration, bandwidth, etc.)
4. Start test and monitor real-time results

### Listener Mode
1. Start iperf3 or sockperf server
2. Wait for incoming connections
3. Monitor received traffic

## API Documentation

See main documentation or visit `/docs` endpoint for interactive API documentation.

## Architecture

```
tools/webui/
├── app.py              # FastAPI backend
├── iperf3_tool.py      # iperf3 wrapper
├── sockperf_tool.py    # sockperf wrapper
├── index.html          # Landing page
├── app.html            # Main application UI
├── app.js              # Client JavaScript
├── assets/             # Static assets (logo, etc.)
└── start.sh            # Startup script
```

## License

MIT License - See parent LICENSE file
