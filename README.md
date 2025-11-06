# TSN SDK

![Build status](https://github.com/tsnlab/tsn-sdk/actions/workflows/build.yml/badge.svg)

**Full suite for Time-Sensitive Networking (TSN) applications with professional testing tools**

---

## Overview

This repository provides a comprehensive TSN development and testing environment with three main components:

1. **TSN SDK** - Low-level Rust-based TSN application framework (root directory)
2. **Web UI Tool** - Professional traffic generation and monitoring interface (`tools/webui/`)
3. **Conformance Tests** - RFC/IEEE standards-based test framework (`tests/conformance/`)

---

## Quick Start

### TSN SDK (Rust)
```bash
# Build the SDK
cargo build --release

# Run latency test
sudo ./target/release/latency -s -i enp11s0  # Server
sudo ./target/release/latency -c -i enp11s0 -t <MAC>  # Client

# Run throughput test
sudo ./target/release/throughput -s -i enp11s0  # Server
sudo ./target/release/throughput -c -i enp11s0 -t <MAC>  # Client
```

### Web UI Tool
```bash
cd tools/webui
./start.sh
# Open http://localhost:9000 in browser
```

### Conformance Tests
```bash
# Run CBS conformance test
python3 tests/conformance/test_802_1qav_cbs.py --interface enp11s0 --remote-mac aa:bb:cc:dd:ee:ff

# Run IEC 61850 latency test
python3 tests/conformance/test_iec61850_latency.py --type goose --duration 60

# Generate test report
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
├── tools/                      # Additional tools
│   └── webui/                  # **NEW: Web-based Traffic Tester**
│       ├── index.html          # Landing page
│       ├── app.html            # Main application UI
│       ├── app.js              # Client JavaScript
│       ├── app.py              # FastAPI backend
│       ├── iperf3_tool.py      # iperf3 wrapper
│       ├── sockperf_tool.py    # sockperf wrapper
│       ├── start.sh            # Quick start script
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

### 2. Web UI Tool (`tools/webui/`)

Professional web-based traffic generation and monitoring interface.

**Features:**
- **Dual Mode**: Generator and Listener modes
- **Multiple Test Types**: iperf3, sockperf, ICMP ping
- **Real-time Visualization**: Live charts with 1G+ bandwidth support
- **Professional UI**: KETI-branded blue accent design
- **WebSocket Communication**: Real-time bidirectional data
- **Data Export**: JSON/CSV export

**Quick Start:**
```bash
cd tools/webui
./start.sh  # Automatic installation and launch
```

**Requirements:**
- Python 3.8+
- FastAPI, uvicorn, websockets
- iperf3, sockperf (for testing)

**Installation:**
```bash
sudo apt install python3 python3-pip iperf3 sockperf
pip3 install --user fastapi uvicorn websockets
```

**Documentation:**
- See `tools/webui/README.md`
- API docs: http://localhost:9000/docs (when running)

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
