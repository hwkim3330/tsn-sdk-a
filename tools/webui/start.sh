#!/bin/bash
# Start TSN Traffic WebUI

cd "$(dirname "$0")"

echo "Starting KETI TSN Traffic Tester WebUI..."
echo "================================================"
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 not found. Please install Python 3.8+"
    exit 1
fi

# Check and install dependencies
echo "Checking dependencies..."
pip3 list 2>/dev/null | grep -q fastapi || pip3 install --user fastapi uvicorn websockets 2>/dev/null

# Check if tools are available
echo "Checking network tools..."
if ! command -v iperf3 &> /dev/null; then
    echo "Warning: iperf3 not found. Install with: sudo apt install iperf3"
fi

if ! command -v sockperf &> /dev/null; then
    echo "Warning: sockperf not found. Install with: sudo apt install sockperf"
fi

echo ""
echo "Starting server on http://localhost:9000"
echo "Press Ctrl+C to stop"
echo ""

python3 app.py --host 0.0.0.0 --port 9000
