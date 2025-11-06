# TSN Conformance Testing Framework

Standards-based conformance testing for Time-Sensitive Networking (TSN) based on IEEE 802.1Q-Annex Z and IEC 61850 TR 90-17.

## Standards Coverage

### IEEE 802.1Q-2018 Annex Z - TSN Conformance Test
Tests for TSN features including:
- **802.1Qav** - Credit-Based Shaper (CBS)
- **802.1Qbv** - Time-Aware Shaper (TAS)
- **802.1Qbu** - Frame Preemption
- **802.1Qcc** - Stream Reservation Protocol (SRP)
- **802.1CB** - Frame Replication and Elimination for Reliability (FRER)
- **802.1AS** - Timing and Synchronization (gPTP)

### IEC 61850 TR 90-17 - Power Quality Data Exchange
Tests for power utility communication requirements:
- Latency bounds testing
- Packet loss testing
- Jitter measurement
- Availability testing

## Test Structure

```
tests/conformance/
├── README.md                   # This file
├── test_802_1qav_cbs.py       # CBS conformance tests
├── test_802_1qbv_tas.py       # TAS conformance tests
├── test_802_1as_gptp.py       # gPTP conformance tests
├── test_802_1cb_frer.py       # FRER conformance tests
├── test_iec61850_latency.py   # IEC 61850 latency tests
├── test_iec61850_availability.py # IEC 61850 availability tests
├── report_generator.py         # Test report generation
└── config/                     # Test configurations
    ├── cbs_profiles.yaml
    ├── tas_schedules.yaml
    └── iec61850_requirements.yaml
```

## Quick Start

```bash
# Run all conformance tests
python3 run_conformance_tests.py

# Run specific standard tests
python3 run_conformance_tests.py --standard 802.1Qav
python3 run_conformance_tests.py --standard IEC61850

# Generate test report
python3 tests/conformance/report_generator.py --format pdf
```

## Test Requirements

### Hardware Requirements
- TSN-capable network interface (Intel i210, i225-LM, etc.)
- Two network interfaces for loopback testing
- PTP-capable hardware (for 802.1AS tests)

### Software Requirements
- Linux kernel 5.4+ with TSN support
- ethtool with TSN capabilities
- ptp4l and phc2sys (linuxptp package)
- Python 3.8+
- Required packages: scapy, pandas, matplotlib, pyyaml

### Installation
```bash
# Install TSN tools
sudo apt install linuxptp ethtool

# Install Python dependencies
pip3 install --user scapy pandas matplotlib pyyaml openpyxl
```

## Test Categories

### 1. Credit-Based Shaper (CBS) Tests
Tests for IEEE 802.1Qav conformance:
- Bandwidth allocation verification
- Priority mapping (PCP to traffic class)
- Credit accumulation/spending behavior
- Burst handling

### 2. Time-Aware Shaper (TAS) Tests
Tests for IEEE 802.1Qbv conformance:
- Gate control list (GCL) execution
- Time slot allocation
- Guard band calculation
- Cycle time accuracy

### 3. gPTP Tests
Tests for IEEE 802.1AS conformance:
- Clock synchronization accuracy
- Sync message intervals
- Delay measurement
- Best Master Clock Algorithm (BMCA)

### 4. FRER Tests
Tests for IEEE 802.1CB conformance:
- Frame replication
- Duplicate elimination
- Sequence number handling
- Recovery latency

### 5. IEC 61850 Tests
Tests for power utility communication:
- Type 4 GOOSE latency (≤10ms)
- Type 5 Sampled Values latency (≤3ms)
- Packet loss rate (<0.01%)
- Jitter measurement

## Test Reports

Test reports are generated in multiple formats:
- **HTML** - Interactive web-based report with charts
- **PDF** - Professional report for documentation
- **JSON** - Machine-readable results
- **Excel** - Detailed data analysis

Reports include:
- Test execution summary
- Pass/fail status for each test
- Measured vs. required performance
- Statistical analysis (mean, std, percentiles)
- Time-series graphs
- Conformance statement

## Configuration

Test configurations are stored in YAML files:

```yaml
# Example: cbs_profiles.yaml
cbs_tests:
  - name: "Class A Traffic"
    priority: 6
    bandwidth: 20  # Mbps
    burst_size: 125000  # bytes
    tolerance: 5  # percent
```

## Example Usage

### Run CBS Conformance Test
```bash
python3 tests/conformance/test_802_1qav_cbs.py \
    --interface enp11s0 \
    --remote-mac aa:bb:cc:dd:ee:ff \
    --duration 60 \
    --report-format pdf
```

### Run IEC 61850 Latency Test
```bash
python3 tests/conformance/test_iec61850_latency.py \
    --interface enp11s0 \
    --type goose \
    --requirement 10000  # 10ms in microseconds
    --duration 300
```

### Generate Comprehensive Report
```bash
python3 tests/conformance/report_generator.py \
    --results results/*.json \
    --format pdf \
    --output conformance_report.pdf
```

## Continuous Integration

The conformance test suite can be integrated into CI/CD pipelines:

```yaml
# Example: .github/workflows/conformance.yml
name: TSN Conformance Tests
on: [push, pull_request]
jobs:
  conformance:
    runs-on: [self-hosted, tsn-hardware]
    steps:
      - uses: actions/checkout@v2
      - name: Run Conformance Tests
        run: python3 run_conformance_tests.py --ci-mode
      - name: Upload Results
        uses: actions/upload-artifact@v2
        with:
          name: conformance-report
          path: results/conformance_report.pdf
```

## References

- **IEEE 802.1Q-2018**: IEEE Standard for Local and Metropolitan Area Networks--Bridges and Bridged Networks
- **IEEE 802.1Q-2018 Annex Z**: Conformance Test
- **IEC 61850-5**: Communication requirements for functions and device models
- **IEC TR 61850-90-17**: Using IEC 61850 to transmit power quality data

## License

GPL-3.0 License - See parent LICENSE file
