# TSN SDK - Time-Sensitive Networking Development Suite

![Build status](https://github.com/tsnlab/tsn-sdk/actions/workflows/build.yml/badge.svg)
[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20RPi-blue.svg)](https://www.kernel.org/)
[![License](https://img.shields.io/badge/license-GPL--3.0-green.svg)](./LICENSE)

**Full suite for Time-Sensitive Networking (TSN) applications with professional testing tools**

🌐 **Live Demo:** [https://hwkim3330.github.io/tsn-sdk-a/](https://hwkim3330.github.io/tsn-sdk-a/)

---

## 🎯 Choose Your Version

<table>
<tr>
<td width="50%">

### 🍓 Basic Version (Web UI)
**Perfect for Raspberry Pi & General Testing**

✅ **Works on any Linux system**
✅ **Raspberry Pi 4/5 supported**
✅ **5-minute installation**
✅ **No special hardware needed**
✅ **iperf3 + sockperf**

[📖 Basic Version Guide →](tools/webui/README.md)

```bash
cd tools/webui
./install.sh
./start.sh
```

</td>
<td width="50%">

### ⚡ Advanced Version (TSN SDK)
**For Professional TSN Development**

✅ **Hardware-accelerated TSN**
✅ **Sub-10μs latency**
✅ **IEEE 802.1 features**
✅ **Rust-based performance**
✅ **CBS, TAS, gPTP, FRER**

[📖 Advanced Version Guide →](#advanced-version)

```bash
cargo build --release
sudo ./target/release/latency -s
```

</td>
</tr>
</table>

---

## Overview

This repository provides a comprehensive TSN development and testing environment:

| Component | Description | Best For |
|-----------|-------------|----------|
| **🍓 Web UI Tool** ([`tools/webui/`](tools/webui/)) | iperf3/sockperf web interface | Raspberry Pi, general testing |
| **⚡ TSN SDK** (root directory) | Low-level Rust TSN framework | Professional TSN development |
| **📊 Conformance Tests** ([`tests/conformance/`](tests/conformance/)) | RFC/IEEE test framework | Standards compliance |

---

## 🚀 Quick Start

### Basic Version (Recommended for Most Users)

**Perfect for: Raspberry Pi, Ubuntu, Debian, or any standard Linux**

```bash
# Clone repository
git clone https://github.com/hwkim3330/tsn-sdk-a.git
cd tsn-sdk-a/tools/webui

# Install (auto-detects Raspberry Pi)
chmod +x install.sh
./install.sh

# Start server
./start.sh

# Open browser
# http://localhost:9000
```

**✅ Works on:** Raspberry Pi 4, RPi 5, Ubuntu 20.04+, Debian 11+, any x86_64/ARM64/ARMv7 system

---

### Advanced Version (TSN SDK)

**Requirements:** TSN-capable NIC (Intel i210, i225-LM, etc.), Rust 1.70+

```bash
# Install Rust
curl -fsSL https://sh.rustup.rs | sh

# Build SDK
cargo build --release

# Run latency test
sudo ./target/release/latency -s -i enp11s0  # Server
sudo ./target/release/latency -c -i enp11s0 -t <MAC>  # Client
```

---

### Conformance Tests

```bash
# Run CBS conformance test
python3 tests/conformance/test_802_1qav_cbs.py --interface enp11s0 --remote-mac aa:bb:cc:dd:ee:ff

# Run IEC 61850 latency test
python3 tests/conformance/test_iec61850_latency.py --type goose --duration 60

# Generate HTML report
python3 tests/conformance/report_generator.py --results results/*.json --format html
```

---

## Repository Structure

```
tsn-sdk/
├── src/                        # TSN SDK Rust source code
│   ├── bin/                    # Latency & throughput binaries
│   ├── cbs.rs                  # Credit-Based Shaper
│   └── tas.rs                  # Time-Aware Shaper
├── driver/                     # Hardware drivers (QDMA, XDMA)
├── tsn.py                      # Python TSN tool
├── config.yaml                 # SDK configuration
├── dist/                       # Distribution files
│
├── index.html                  # **Main Web UI Application**
├── app.js                      # Client JavaScript (real-time charts)
├── app.py                      # FastAPI backend with WebSocket
├── start.sh                    # Quick start script
├── assets/                     # UI assets (KETI logo, etc.)
│
├── tools/                      # Additional tools
│   └── webui/                  # Web UI backend modules
│       ├── iperf3_tool.py      # iperf3 wrapper with real-time parsing
│       ├── sockperf_tool.py    # sockperf wrapper
│       └── README.md           # Web UI documentation
│
└── tests/                      # **NEW: Conformance Testing**
    └── conformance/
        ├── README.md           # Test framework documentation
        ├── test_802_1qav_cbs.py       # CBS conformance tests
        ├── test_iec61850_latency.py   # IEC 61850 tests
        ├── report_generator.py        # Report generation
        └── config/             # Test configurations
```

---

## Component Details

### 1. TSN SDK (Root Directory)

Low-level TSN SDK written in Rust for high-performance networking applications.

**Features:**
- Hardware-accelerated packet processing
- Credit-Based Shaper (802.1Qav) support
- Time-Aware Shaper (802.1Qbv) support
- Raw Ethernet frame handling
- PTP hardware timestamp support
- Multi-queue traffic class management

**Requirements:**
- Rust 1.70+ (`curl -fsSL https://sh.rustup.rs | sh`)
- Linux kernel 5.4+
- TSN-capable NIC (Intel i210, i225-LM, etc.)

**Build:**
```bash
cargo build --release  # Release build
cargo build            # Debug build
```

**Documentation:**
- API documentation: `cargo doc --open`
- Examples: See `src/bin/` directory
- Configuration: See `config.yaml`

### 2. Web UI Tool (`tools/webui/`) - **Basic Version** 🍓

**Lightweight network performance testing for any Linux system, including Raspberry Pi**

Professional web-based traffic generation and monitoring interface.

**Why Choose Basic Version:**
- ✅ **Universal Compatibility**: Works on any Linux (x86_64, ARM64, ARMv7)
- ✅ **Raspberry Pi Optimized**: Tested on RPi 4 and RPi 5
- ✅ **Easy Installation**: One-line installer with auto-detection
- ✅ **No Special Hardware**: Standard NICs work perfectly
- ✅ **Quick Setup**: 5-minute installation
- ✅ **Remote Access**: Web-based monitoring from any device

**Features:**
- **Dual Mode**: Generator and Listener modes
- **Multiple Test Types**: iperf3 (TCP/UDP), sockperf (ping-pong, under-load), ICMP ping
- **Real-time Visualization**: Live charts with 1-second interval updates
- **Professional UI**: KETI-branded blue accent design (#0066CC)
- **WebSocket Communication**: Real-time bidirectional data with asyncio event loop
- **Horizontal Layout**: Responsive control panel with 4 sections
- **Unbuffered Output**: `stdbuf` integration for real-time iperf3 parsing
- **Data Export**: JSON/CSV export
- **Systemd Integration**: Auto-start on boot

**Quick Start:**
```bash
cd tools/webui
./install.sh  # Auto-detects Raspberry Pi and installs dependencies
./start.sh    # Launches web server
# Open http://localhost:9000
```

**Requirements:**
- **OS**: Ubuntu 20.04+, Debian 11+, Raspberry Pi OS
- **Hardware**: Any standard NIC, Raspberry Pi 4/5 recommended
- **Python**: 3.8+ (auto-installed by installer)
- **Dependencies**: iperf3, sockperf (auto-installed)

**Manual Installation:**
```bash
# System packages
sudo apt install python3 python3-pip iperf3 sockperf

# Python dependencies
pip3 install --user -r requirements.txt

# Start server
python3 app.py --host 0.0.0.0 --port 9000
```

**Raspberry Pi Performance:**
| Model | TCP Throughput | Latency (Avg) | Recommended |
|-------|----------------|---------------|-------------|
| RPi 5 | ~900 Mbps | <100 μs | ⭐ Best |
| RPi 4 | ~940 Mbps | ~150 μs | ✅ Excellent |
| RPi 3B+ | ~300 Mbps | ~300 μs | ⚠️ Limited |

**Documentation:**
- **Full Guide**: [`tools/webui/README.md`](tools/webui/README.md)
- **API Docs**: http://localhost:9000/docs (interactive Swagger UI)
- **Installation**: See `install.sh` for full automation

### 3. Conformance Tests (`tests/conformance/`)

Standards-based conformance testing framework for TSN.

**Supported Standards:**
- **IEEE 802.1Q-2018 Annex Z**: TSN Conformance Test
  - 802.1Qav: Credit-Based Shaper (CBS)
  - 802.1Qbv: Time-Aware Shaper (TAS)
  - 802.1AS: gPTP synchronization
  - 802.1CB: Frame Replication and Elimination (FRER)
- **IEC 61850 TR 90-17**: Power utility communication requirements
  - Type 4 GOOSE latency (≤10ms)
  - Type 5 Sampled Values (≤3ms)
  - Packet loss testing (<0.01%)

**Test Reports:**
- HTML: Interactive web-based reports
- PDF: Professional documentation reports
- Excel: Detailed data analysis
- JSON: Machine-readable results

**Quick Start:**
```bash
# Run CBS test
python3 tests/conformance/test_802_1qav_cbs.py \
    --interface enp11s0 \
    --remote-mac aa:bb:cc:dd:ee:ff \
    --duration 60

# Run IEC 61850 test
python3 tests/conformance/test_iec61850_latency.py \
    --type goose \
    --duration 60

# Generate HTML report
python3 tests/conformance/report_generator.py \
    --results results/cbs_conformance.json \
    --format html
```

**Documentation:**
- See `tests/conformance/README.md`
- Configuration examples in `tests/conformance/config/`

---

## Installation

### System Requirements

**Hardware:**
- TSN-capable network interface (Intel i210, i225-LM, Microchip LAN966x, etc.)
- Two network interfaces recommended for loopback testing
- PTP-capable hardware (for 802.1AS tests)

**Software:**
- Linux kernel 5.4+ with TSN support
- Rust 1.70+ (for SDK)
- Python 3.8+ (for Web UI and tests)

### Ubuntu/Debian Installation

```bash
# System packages
sudo apt update
sudo apt install -y build-essential pkg-config libssl-dev \
    ethtool linuxptp iperf3 sockperf \
    python3 python3-pip

# Rust (for SDK)
curl -fsSL https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Python packages (for Web UI and tests)
pip3 install --user fastapi uvicorn websockets \
    pandas matplotlib pyyaml openpyxl

# Build TSN SDK
cargo build --release
```

---

## Usage Examples

### Example 1: Basic Latency Test
```bash
# Terminal 1 - Server
sudo ./target/release/latency -s -i enp11s0

# Terminal 2 - Client
sudo ./target/release/latency -c -i enp11s0 -t aa:bb:cc:dd:ee:ff
```

### Example 2: Web UI Traffic Generation
```bash
# Start Web UI
cd tools/webui && ./start.sh

# In browser (http://localhost:9000):
# 1. Select "Generator Mode"
# 2. Set remote IP to target device
# 3. Choose "iperf3 - TCP Throughput"
# 4. Click "Start Test"
# 5. Monitor real-time graphs
```

### Example 3: Conformance Testing
```bash
# Run complete CBS conformance test
python3 tests/conformance/test_802_1qav_cbs.py \
    --interface enp11s0 \
    --remote-mac aa:bb:cc:dd:ee:ff \
    --duration 120 \
    --output results/cbs_test.json

# Generate professional PDF report
python3 tests/conformance/report_generator.py \
    --results results/cbs_test.json \
    --format pdf \
    --output reports/cbs_conformance_report.pdf
```

---

## Development

### Building the SDK
```bash
# Debug build with verbose output
cargo build --verbose

# Release build with optimizations
cargo build --release

# Run tests
cargo test

# Generate documentation
cargo doc --open
```

### Running Web UI in Development Mode
```bash
cd tools/webui
python3 app.py --host 0.0.0.0 --port 9000 --reload
```

### Creating Custom Tests
```python
# See tests/conformance/test_802_1qav_cbs.py for example structure
from pathlib import Path
import json

class CustomConformanceTest:
    def __init__(self):
        self.results = {
            "test_suite": "Custom Test",
            "tests": [],
            "total_tests": 0,
            "passed": 0,
            "failed": 0
        }

    def run_test(self):
        # Your test logic here
        pass

    def save_results(self, output_file):
        with open(output_file, 'w') as f:
            json.dump(self.results, f, indent=2)
```

---

## Troubleshooting

### SDK Build Errors
```bash
# Update Rust
rustup update

# Clean build
cargo clean && cargo build --release

# Check dependencies
cargo check
```

### Web UI Connection Issues
```bash
# Check if port is available
ss -tlnp | grep 9000

# Kill existing process
pkill -f "python3 app.py"

# Restart with different port
python3 app.py --port 9001
```

### Test Failures
```bash
# Verify network interface
ip link show enp11s0

# Check TSN capabilities
ethtool -k enp11s0 | grep -i "time\|queue"

# Verify tools are installed
which iperf3 sockperf

# Check permissions
sudo setcap cap_net_raw,cap_net_admin=eip /usr/bin/iperf3
```

---

## 🆚 Basic vs Advanced Comparison

### Feature Comparison

| Feature | Basic Version (Web UI) | Advanced Version (TSN SDK) |
|---------|------------------------|----------------------------|
| **Platform Support** | ✅ Any Linux, Raspberry Pi | ⚠️ TSN-capable hardware only |
| **Installation Time** | ⏱️ 5 minutes | ⏱️ 30+ minutes |
| **Tools** | iperf3, sockperf, ping | Rust-based low-level TSN |
| **Hardware Requirements** | Any standard NIC | Intel i210, i225-LM, etc. |
| **Latency Performance** | ~100-150 μs (software) | <10 μs (hardware timestamps) |
| **TSN Features** | ❌ No | ✅ CBS, TAS, gPTP, FRER |
| **User Interface** | ✅ Web-based GUI | ❌ CLI only |
| **Remote Monitoring** | ✅ Yes (web browser) | ❌ Local only |
| **Data Export** | ✅ JSON, CSV | ✅ Custom formats |
| **Raspberry Pi** | ✅ Full support | ❌ Not supported |
| **Learning Curve** | ⭐ Easy | ⭐⭐⭐ Advanced |
| **Cost** | 💰 ~$35 (RPi 4) | 💰💰💰 $200+ (TSN NIC) |

### When to Use Each Version

**Use Basic Version (Web UI) if:**
- 🍓 Testing on Raspberry Pi
- 💻 Using standard Linux servers
- 🚀 Need quick setup and easy testing
- 📊 Want web-based monitoring and charts
- 👥 Sharing results with non-technical users
- 🎓 Learning network performance concepts
- 💰 Budget-conscious project

**Use Advanced Version (TSN SDK) if:**
- ⚡ Require ultra-low latency (<10 μs)
- 🔧 Developing TSN applications
- 📡 Need IEEE 802.1 TSN features (CBS, TAS, gPTP, FRER)
- 🎯 Hardware timestamping required
- 🏭 Industrial/automotive TSN deployment
- 🔬 TSN research and development
- 💾 Raw Ethernet frame control needed

### Migration Path

Start with **Basic Version** for:
1. ✅ Learning and experimentation
2. ✅ Initial network characterization
3. ✅ Proof-of-concept testing

Upgrade to **Advanced Version** when:
1. ⚡ Sub-10μs latency required
2. 🔧 TSN-specific features needed
3. 📈 Production deployment ready

---

## 🍓 Raspberry Pi Deployment

The **Basic Version** is optimized for Raspberry Pi deployment, making it perfect for portable network testing.

### Recommended Hardware

**Raspberry Pi 5 (Recommended)**
- **CPU**: Quad-core ARM Cortex-A76 @ 2.4 GHz
- **RAM**: 8GB
- **Network**: Gigabit Ethernet (BCM54213PE PHY)
- **Performance**: ~900 Mbps TCP, <100 μs latency
- **Price**: ~$80

**Raspberry Pi 4 Model B**
- **CPU**: Quad-core ARM Cortex-A72 @ 1.8 GHz
- **RAM**: 4GB or 8GB
- **Network**: Gigabit Ethernet (BCM54213 PHY)
- **Performance**: ~940 Mbps TCP, ~150 μs latency
- **Price**: ~$55-75

### Quick Raspberry Pi Setup

```bash
# 1. Flash Raspberry Pi OS (64-bit recommended)
#    Download from: https://www.raspberrypi.com/software/

# 2. First boot configuration
sudo raspi-config
# Enable SSH, set hostname, expand filesystem

# 3. Update system
sudo apt update && sudo apt upgrade -y

# 4. Clone and install
cd ~
git clone https://github.com/hwkim3330/tsn-sdk-a.git
cd tsn-sdk-a/tools/webui
chmod +x install.sh
./install.sh

# 5. Start server
./start.sh

# 6. Access from any device on network
# http://<raspberry-pi-ip>:9000
```

### Raspberry Pi Optimization Tips

**1. Performance Mode**
```bash
# Set CPU governor to performance
echo "performance" | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Make permanent (add to /etc/rc.local)
echo 'echo "performance" > /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor' | sudo tee -a /etc/rc.local
```

**2. Disable Unnecessary Services**
```bash
# Disable WiFi and Bluetooth (if using Ethernet only)
sudo systemctl disable wpa_supplicant
sudo systemctl disable bluetooth

# Add to /boot/config.txt
echo "dtoverlay=disable-wifi" | sudo tee -a /boot/config.txt
echo "dtoverlay=disable-bt" | sudo tee -a /boot/config.txt
```

**3. Network Tuning**
```bash
# Increase network buffers
sudo sysctl -w net.core.rmem_max=134217728
sudo sysctl -w net.core.wmem_max=134217728

# Make permanent (add to /etc/sysctl.conf)
echo "net.core.rmem_max=134217728" | sudo tee -a /etc/sysctl.conf
echo "net.core.wmem_max=134217728" | sudo tee -a /etc/sysctl.conf
```

**4. Auto-Start on Boot**
```bash
# The install.sh script offers to create systemd service
# Or create manually:
sudo systemctl enable tsn-traffic-webui
sudo systemctl start tsn-traffic-webui
```

### Raspberry Pi Use Cases

**1. Portable Network Tester**
- Carry RPi 4/5 in a small case
- Test networks on-site
- Generate professional reports

**2. Continuous Monitoring**
- 24/7 network monitoring
- Low power consumption (~5W)
- Email alerts on issues

**3. Education and Training**
- Teach network concepts
- Demonstrate QoS and traffic shaping
- Hands-on TSN learning

**4. IoT Gateway Testing**
- Test IoT device connectivity
- Measure real-world latency
- Simulate production traffic

---

## Contributing

Contributions are welcome! Please see `CONTRIBUTING.md` for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`cargo test` and `python3 -m pytest tests/`)
5. Commit your changes (`git commit -am 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## References

### TSN Standards
- **IEEE 802.1Q-2018**: Bridges and Bridged Networks
- **IEEE 802.1Qav**: Credit-Based Shaper
- **IEEE 802.1Qbv**: Time-Aware Shaper
- **IEEE 802.1AS**: gPTP Timing and Synchronization
- **IEEE 802.1CB**: Frame Replication and Elimination

### IEC 61850 Standards
- **IEC 61850-5**: Communication requirements
- **IEC TR 61850-90-17**: Using IEC 61850 for power quality data

### Useful Links
- [TSN Lab](https://tsnlab.com)
- [IEEE 802.1 Working Group](https://1.ieee802.org/)
- [Linux TSN Documentation](https://www.kernel.org/doc/html/latest/networking/tsn.html)

---

## License

The TSN SDK is distributed under **GPL-3.0 license**. See [LICENSE](./LICENSE) file for details.

If you need other license than GPL-3.0 for proprietary use or professional support, please contact: **contact@tsnlab.com**

---

## Acknowledgments

- **KETI (Korea Electronics Technology Institute)** - Web UI design and requirements
- **TSN Lab** - Original TSN SDK development
- **Linux Foundation** - TSN kernel support

---

## Contact

- **Issues**: https://github.com/hwkim3330/tsn-sdk-a/issues
- **Email**: contact@tsnlab.com
- **Web**: https://tsnlab.com

---

**Made with ❤️ by the TSN Community**
