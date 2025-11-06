#!/bin/bash
# TSN Traffic Tester Web UI - Installation Script
# Supports: Ubuntu 20.04+, Debian 11+, Raspberry Pi OS (32-bit/64-bit)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Detect system information
detect_system() {
    print_info "Detecting system information..."

    # OS Detection
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    else
        print_error "Cannot detect OS. /etc/os-release not found."
        exit 1
    fi

    # Architecture Detection
    ARCH=$(uname -m)

    # Raspberry Pi Detection
    IS_RPI=0
    if [ -f /proc/device-tree/model ]; then
        MODEL=$(cat /proc/device-tree/model)
        if [[ "$MODEL" == *"Raspberry Pi"* ]]; then
            IS_RPI=1
        fi
    fi

    print_info "OS: $OS $OS_VERSION"
    print_info "Architecture: $ARCH"
    if [ $IS_RPI -eq 1 ]; then
        print_info "Detected Raspberry Pi: $MODEL"
    fi
}

# Check if running as root for system package installation
check_privileges() {
    if [ "$EUID" -eq 0 ]; then
        SUDO=""
    else
        SUDO="sudo"
        print_warning "Not running as root. Will use sudo for system packages."
    fi
}

# Update system packages
update_system() {
    print_info "Updating system packages..."

    if [[ "$OS" == "ubuntu" || "$OS" == "debian" || "$OS" == "raspbian" ]]; then
        $SUDO apt update
        print_success "System packages updated"
    elif [[ "$OS" == "centos" || "$OS" == "rhel" || "$OS" == "fedora" ]]; then
        $SUDO yum update -y || $SUDO dnf update -y
        print_success "System packages updated"
    else
        print_warning "Unknown OS. Skipping system update."
    fi
}

# Install Python 3
install_python() {
    print_info "Checking Python 3 installation..."

    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | awk '{print $2}')
        print_success "Python 3 already installed: $PYTHON_VERSION"

        # Check if version is >= 3.8
        PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
        PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

        if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 8 ]); then
            print_error "Python 3.8+ required. Current: $PYTHON_VERSION"
            exit 1
        fi
    else
        print_info "Installing Python 3..."
        if [[ "$OS" == "ubuntu" || "$OS" == "debian" || "$OS" == "raspbian" ]]; then
            $SUDO apt install -y python3 python3-pip python3-venv
        elif [[ "$OS" == "centos" || "$OS" == "rhel" || "$OS" == "fedora" ]]; then
            $SUDO yum install -y python3 python3-pip || $SUDO dnf install -y python3 python3-pip
        fi
        print_success "Python 3 installed"
    fi
}

# Install pip dependencies
install_python_deps() {
    print_info "Installing Python dependencies..."

    # Check if pip is available
    if ! command -v pip3 &> /dev/null; then
        print_info "Installing pip..."
        if [[ "$OS" == "ubuntu" || "$OS" == "debian" || "$OS" == "raspbian" ]]; then
            $SUDO apt install -y python3-pip
        fi
    fi

    # Install dependencies
    if [ -f "requirements.txt" ]; then
        print_info "Installing from requirements.txt..."
        pip3 install --user -r requirements.txt
        print_success "Python dependencies installed"
    else
        print_warning "requirements.txt not found. Installing manually..."
        pip3 install --user fastapi uvicorn websockets
    fi
}

# Install iperf3
install_iperf3() {
    print_info "Checking iperf3 installation..."

    if command -v iperf3 &> /dev/null; then
        IPERF_VERSION=$(iperf3 --version | head -1)
        print_success "iperf3 already installed: $IPERF_VERSION"
    else
        print_info "Installing iperf3..."
        if [[ "$OS" == "ubuntu" || "$OS" == "debian" || "$OS" == "raspbian" ]]; then
            $SUDO apt install -y iperf3
        elif [[ "$OS" == "centos" || "$OS" == "rhel" ]]; then
            $SUDO yum install -y iperf3 || $SUDO dnf install -y iperf3
        elif [[ "$OS" == "fedora" ]]; then
            $SUDO dnf install -y iperf3
        fi
        print_success "iperf3 installed"
    fi
}

# Install sockperf
install_sockperf() {
    print_info "Checking sockperf installation..."

    if command -v sockperf &> /dev/null; then
        print_success "sockperf already installed"
    else
        print_info "Installing sockperf..."
        if [[ "$OS" == "ubuntu" || "$OS" == "debian" || "$OS" == "raspbian" ]]; then
            # sockperf is available in Ubuntu repos
            if $SUDO apt install -y sockperf 2>/dev/null; then
                print_success "sockperf installed from repository"
            else
                print_warning "sockperf not available in repository. Will use iperf3 and ping only."
            fi
        else
            print_warning "sockperf not available for this OS. Will use iperf3 and ping only."
        fi
    fi
}

# Create systemd service (optional)
create_systemd_service() {
    print_info "Creating systemd service (optional)..."

    read -p "Do you want to create a systemd service for auto-start? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping systemd service creation"
        return
    fi

    INSTALL_DIR=$(pwd)
    SERVICE_FILE="/etc/systemd/system/tsn-traffic-webui.service"

    cat <<EOF | $SUDO tee $SERVICE_FILE > /dev/null
[Unit]
Description=TSN Traffic Tester Web UI
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/python3 $INSTALL_DIR/app.py --host 0.0.0.0 --port 9000
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    $SUDO systemctl daemon-reload
    print_success "Systemd service created: $SERVICE_FILE"
    print_info "To enable auto-start: sudo systemctl enable tsn-traffic-webui"
    print_info "To start now: sudo systemctl start tsn-traffic-webui"
}

# Test installation
test_installation() {
    print_info "Testing installation..."

    # Test Python imports
    python3 -c "import fastapi, uvicorn" 2>/dev/null
    if [ $? -eq 0 ]; then
        print_success "Python dependencies OK"
    else
        print_error "Python dependencies test failed"
        exit 1
    fi

    # Test iperf3
    if command -v iperf3 &> /dev/null; then
        print_success "iperf3 OK"
    else
        print_warning "iperf3 not found"
    fi

    # Test sockperf
    if command -v sockperf &> /dev/null; then
        print_success "sockperf OK"
    else
        print_warning "sockperf not found (optional)"
    fi
}

# Main installation flow
main() {
    echo ""
    echo "================================================"
    echo "  TSN Traffic Tester Web UI - Installation"
    echo "================================================"
    echo ""

    detect_system
    check_privileges

    echo ""
    read -p "Continue with installation? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Installation cancelled"
        exit 0
    fi

    echo ""
    print_info "Starting installation..."
    echo ""

    update_system
    install_python
    install_python_deps
    install_iperf3
    install_sockperf

    echo ""
    test_installation

    echo ""
    create_systemd_service

    echo ""
    echo "================================================"
    print_success "Installation completed!"
    echo "================================================"
    echo ""
    echo "To start the server manually:"
    echo "  cd $(pwd)"
    echo "  ./start.sh"
    echo ""
    echo "Or run directly:"
    echo "  python3 app.py --host 0.0.0.0 --port 9000"
    echo ""
    echo "Then open: http://localhost:9000"
    echo ""

    if [ $IS_RPI -eq 1 ]; then
        print_info "Raspberry Pi detected!"
        print_info "For best performance:"
        print_info "  - Use Ethernet connection (not WiFi)"
        print_info "  - Ensure sufficient power supply (5V 3A recommended)"
        print_info "  - Consider using RPi 4 or RPi 5 for better performance"
    fi
}

# Run main installation
main
