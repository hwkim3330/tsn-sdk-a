# KETI TSN Traffic Tester - Web UI (Basic Version)

**Lightweight network performance testing tool for any Linux system, including Raspberry Pi**

[![Platform](https://img.shields.io/badge/platform-Linux-blue.svg)](https://www.kernel.org/)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
[![ARM](https://img.shields.io/badge/ARM-supported-orange.svg)](https://www.raspberrypi.org/)

---

## 🌟 Overview

The **Basic Version** of TSN Traffic Tester provides professional network performance testing using standard tools (iperf3, sockperf) with a modern web interface. Perfect for:

- 🍓 **Raspberry Pi** (RPi 4, RPi 5)
- 💻 **Standard Linux** (Ubuntu, Debian, CentOS)
- 🖥️ **x86_64 and ARM64/ARMv7** architectures
- 🌐 **Remote monitoring** via web browser
- ⚡ **No special hardware** required

**Looking for hardware-accelerated TSN features?** Check out the [Advanced Version](../../README.md#advanced-version) (TSN SDK) in the root directory.

---

## 📦 Features

### Network Testing
- ✅ **iperf3** - TCP/UDP throughput testing (up to 10 Gbps)
- ✅ **sockperf** - Ultra-low latency measurement (microsecond precision)
- ✅ **ICMP Ping** - Basic connectivity and latency testing
- ✅ **Real-time monitoring** with live charts

### User Interface
- 🎨 **Professional UI** with KETI branding
- 📊 **Live charts** with Chart.js (bandwidth, latency, jitter)
- 📱 **Mobile responsive** design
- 🔄 **Dual mode**: Generator and Listener
- 💾 **Data export** (JSON, CSV)

### Platform Support
- ✅ **Raspberry Pi** 4 and 5 (32-bit and 64-bit OS)
- ✅ **Ubuntu** 20.04+
- ✅ **Debian** 11+
- ✅ **Raspberry Pi OS** (formerly Raspbian)
- ✅ **CentOS/RHEL** 8+
- ✅ **ARM64, ARMv7, x86_64** architectures

---

## 🚀 Quick Start

### One-Line Installation (Recommended)

```bash
cd tools/webui
chmod +x install.sh
./install.sh
```

The installer will:
- ✅ Detect your platform (Raspberry Pi, Ubuntu, etc.)
- ✅ Install Python 3.8+
- ✅ Install iperf3 and sockperf
- ✅ Install Python dependencies
- ✅ Optionally create systemd service
- ✅ Test installation

### Start the Server

```bash
./start.sh
```

Open your browser to **http://localhost:9000**

---

## 📋 Manual Installation

### Prerequisites

**System Packages:**
```bash
# Debian/Ubuntu/Raspberry Pi OS
sudo apt update
sudo apt install -y python3 python3-pip iperf3 sockperf

# CentOS/RHEL
sudo yum install -y python3 python3-pip iperf3
```

**Python Dependencies:**
```bash
pip3 install --user -r requirements.txt
```

Or install manually:
```bash
pip3 install --user fastapi uvicorn websockets
```

### Start Server Manually

```bash
python3 app.py --host 0.0.0.0 --port 9000
```

---

## 🍓 Raspberry Pi Setup

### Supported Models
- **Raspberry Pi 5** (8GB) - ⭐ Recommended
- **Raspberry Pi 4** (4GB/8GB) - ✅ Full support
- **Raspberry Pi 3B+** - ⚠️ Limited performance

### Installation on Raspberry Pi

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Clone repository
cd ~
git clone https://github.com/hwkim3330/tsn-sdk-a.git
cd tsn-sdk-a/tools/webui

# Run installer
chmod +x install.sh
./install.sh

# Start server
./start.sh
```

### Raspberry Pi Performance Tips

1. **Use Ethernet** (not WiFi) for accurate measurements
2. **Adequate power supply**: 5V 3A recommended
3. **Enable performance mode**:
   ```bash
   echo "performance" | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
   ```
4. **Disable WiFi/Bluetooth** if not needed:
   ```bash
   # Add to /boot/config.txt
   dtoverlay=disable-wifi
   dtoverlay=disable-bt
   ```

### Expected Performance

| Model | TCP Throughput | Latency (Avg) |
|-------|----------------|---------------|
| RPi 5 | ~900 Mbps | <100 μs |
| RPi 4 | ~940 Mbps | ~150 μs |
| RPi 3B+ | ~300 Mbps | ~300 μs |

---

## 🎯 Usage

### Generator Mode (Send Traffic)

1. Open http://localhost:9000
2. Select **Generator Mode**
3. Configure:
   - **Remote IP**: Target server IP
   - **Test Type**: iperf3 TCP/UDP, sockperf, or ping
   - **Duration**: Test duration in seconds
4. Click **Start Test**
5. Monitor real-time results

### Listener Mode (Receive Traffic)

1. Select **Listener Mode**
2. Click **Start iperf3 Server** or **Start sockperf Server**
3. Note the server port (5201 for iperf3, 11111 for sockperf)
4. Configure remote generator to connect to this IP and port

### Test Types

#### iperf3 - TCP Throughput
```bash
# Tests maximum TCP bandwidth
# Good for: Network capacity testing
# Default port: 5201
```

#### iperf3 - UDP Throughput
```bash
# Tests UDP bandwidth with packet loss measurement
# Good for: Video streaming simulation
# Configurable bandwidth limit
```

#### sockperf - Ping-Pong
```bash
# Round-trip latency measurement
# Good for: Ultra-low latency applications
# Default port: 11111
```

#### sockperf - Under Load
```bash
# Latency under traffic load
# Good for: QoS testing
# Configurable message rate (MPS)
```

#### ICMP Ping
```bash
# Basic connectivity and latency
# Good for: Quick network check
# Uses standard ping command
```

---

## 📊 Web Interface

### Landing Page
- Feature overview
- Installation guide
- Quick start instructions
- Links to documentation

### Main Application
- **Control Panel**: Test configuration
- **Live Charts**: Real-time performance graphs
- **Statistics**: Current metrics (bandwidth, latency, jitter, loss)
- **Console Log**: Test output and status messages
- **Export**: Save results as JSON/CSV

### Live Metrics
- **Bandwidth**: Throughput in Mbps/Gbps (auto-scaling)
- **Latency**: Average and P99 in microseconds
- **Jitter**: Latency variation
- **Packet Loss**: Percentage of lost packets

---

## 🔧 Configuration

### Server Options

```bash
python3 app.py --help
```

Options:
- `--host`: Bind address (default: 0.0.0.0)
- `--port`: Port number (default: 9000)
- `--reload`: Enable auto-reload for development

### Environment Variables

```bash
export TSN_HOST="0.0.0.0"
export TSN_PORT="9000"
```

### Remote Access

To access from other devices:
```bash
# Start server on all interfaces
python3 app.py --host 0.0.0.0 --port 9000

# Find your IP
hostname -I

# Access from browser
# http://<your-ip>:9000
```

### Firewall Configuration

```bash
# Ubuntu/Debian
sudo ufw allow 9000/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=9000/tcp
sudo firewall-cmd --reload
```

---

## 🐳 Docker Support (Coming Soon)

```bash
# Build image
docker build -t tsn-traffic-tester .

# Run container
docker run -d -p 9000:9000 --name tsn-tester tsn-traffic-tester

# Access
http://localhost:9000
```

---

## 🔄 Auto-Start with Systemd

The installer can create a systemd service for automatic startup.

### Manual Service Creation

```bash
sudo nano /etc/systemd/system/tsn-traffic-webui.service
```

```ini
[Unit]
Description=TSN Traffic Tester Web UI
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/tsn-sdk-a/tools/webui
ExecStart=/usr/bin/python3 app.py --host 0.0.0.0 --port 9000
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Enable and Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable tsn-traffic-webui
sudo systemctl start tsn-traffic-webui
sudo systemctl status tsn-traffic-webui
```

---

## 📈 API Documentation

Interactive API documentation available at:
- Swagger UI: http://localhost:9000/docs
- ReDoc: http://localhost:9000/redoc

### REST Endpoints

```
GET  /                    - Landing page
GET  /app.html            - Main application
GET  /api/status          - Get current status
```

### WebSocket Protocol

```
WebSocket /ws             - Real-time bidirectional communication

Client → Server:
  {"type": "start_iperf_client", "data": {...}}
  {"type": "start_sockperf_pingpong", "data": {...}}
  {"type": "stop_iperf"}

Server → Client:
  {"type": "test_progress", "data": {...}}
  {"type": "test_complete", "data": {...}}
  {"type": "error", "message": "..."}
```

---

## 🛠️ Troubleshooting

### iperf3 Not Found

```bash
# Debian/Ubuntu
sudo apt install iperf3

# CentOS/RHEL
sudo yum install iperf3
```

### sockperf Not Available

sockperf is optional. If not available:
- Use iperf3 and ping only
- Or compile sockperf from source

### Port Already in Use

```bash
# Check what's using port 9000
sudo lsof -i :9000

# Kill the process
sudo kill <PID>

# Or use different port
python3 app.py --port 9001
```

### Permission Denied on Raspberry Pi

```bash
# Add user to required groups
sudo usermod -a -G netdev,dialout $USER

# Logout and login again
```

### Low Performance on Raspberry Pi

1. Check CPU throttling:
   ```bash
   vcgencmd measure_clock arm
   vcgencmd measure_temp
   ```

2. Check power supply (undervoltage warning):
   ```bash
   vcgencmd get_throttled
   ```

3. Ensure proper cooling (heatsink/fan)

---

## 🆚 Basic vs Advanced Version

| Feature | Basic Version (This) | Advanced Version (Root SDK) |
|---------|---------------------|----------------------------|
| **Platform** | Any Linux, Raspberry Pi | TSN-capable hardware required |
| **Tools** | iperf3, sockperf, ping | Rust-based low-level TSN |
| **Hardware** | Standard NICs | Intel i210, i225-LM, etc. |
| **TSN Features** | ❌ No | ✅ CBS, TAS, gPTP, FRER |
| **Latency** | ~100 μs | <10 μs (hardware timestamps) |
| **Installation** | Easy (5 minutes) | Complex (requires Rust) |
| **Use Case** | General testing | TSN development |

**When to use Basic Version:**
- Testing on Raspberry Pi or standard servers
- Quick network performance checks
- Learning network testing concepts
- No special hardware available

**When to use Advanced Version:**
- TSN application development
- Ultra-low latency requirements (<10 μs)
- IEEE 802.1 TSN features needed
- Hardware timestamps required

See [main README](../../README.md) for Advanced Version details.

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Test on multiple platforms
4. Submit pull request

---

## 📝 License

MIT License - See [LICENSE](../../LICENSE) file

---

## 🔗 Links

- **Main Repository**: https://github.com/hwkim3330/tsn-sdk-a
- **Issues**: https://github.com/hwkim3330/tsn-sdk-a/issues
- **Advanced Version**: [Root README](../../README.md)

---

## 💬 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: contact@tsnlab.com

---

**Made with ❤️ for the TSN Community**

*Compatible with Raspberry Pi 4, Raspberry Pi 5, and all standard Linux distributions*
