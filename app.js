// ============================================================================
// KETI TSN Traffic Tester - Main Application
// ============================================================================

let ws = null;
let mainChart = null;
let currentMode = 'generator';
let isExpanded = false;
let isTestRunning = false;

const MAX_DATA_POINTS = 100;
const chartData = {
    labels: [],
    bandwidth: [],
    latency: [],
    latencyP99: []
};

// Helper function to format bandwidth with appropriate units
function formatBandwidth(mbps) {
    if (mbps >= 1000) {
        return {
            value: (mbps / 1000).toFixed(2),
            unit: 'Gbps',
            raw: mbps
        };
    }
    return {
        value: mbps.toFixed(2),
        unit: 'Mbps',
        raw: mbps
    };
}

// ============================================================================
// WebSocket Connection
// ============================================================================

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        log('Connected to server', 'success');
        updateStatus(true);
    };

    ws.onclose = () => {
        log('Disconnected from server', 'error');
        updateStatus(false);
        setTimeout(connectWebSocket, 3000);
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleMessage(message);
    };

    ws.onerror = (error) => {
        log('WebSocket error: ' + error, 'error');
    };
}

function sendMessage(type, data = {}) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, data }));
    } else {
        log('Not connected to server', 'error');
    }
}

function updateStatus(connected) {
    const statusEl = document.getElementById('status');
    if (connected) {
        statusEl.textContent = 'Connected';
        statusEl.className = 'status-badge connected';
    } else {
        statusEl.textContent = 'Disconnected';
        statusEl.className = 'status-badge disconnected';
    }
}

// ============================================================================
// Message Handling
// ============================================================================

function handleMessage(message) {
    const { type, data, message: msg } = message;

    switch(type) {
        case 'connected':
            log(msg || 'Connected', 'success');
            break;

        case 'iperf_started':
        case 'sockperf_started':
        case 'server_started':
            log(msg, 'success');
            updateServerStatus();
            break;

        case 'server_stopped':
            log(msg, 'info');
            updateServerStatus();
            break;

        case 'progress':
            updateProgress(data);
            break;

        case 'test_complete':
            log('Test complete', 'success');
            updateStats(data);
            isTestRunning = false;
            break;

        case 'error':
            log('Error: ' + (msg || data.message), 'error');
            break;

        case 'server_status':
            updateServerDots(data);
            break;

        default:
            log(`Event: ${type}`, 'info');
    }
}

// ============================================================================
// Mode Switching
// ============================================================================

function switchMode(mode) {
    currentMode = mode;

    // Update tabs
    const tabs = document.querySelectorAll('.mode-tab');
    tabs.forEach((tab, index) => {
        if ((mode === 'generator' && index === 0) || (mode === 'listener' && index === 1)) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update description
    const desc = document.getElementById('mode-description');
    const generatorConfig = document.getElementById('generator-config');

    if (mode === 'generator') {
        desc.textContent = 'Generate traffic and send to remote listener';
        generatorConfig.style.display = 'block';
    } else {
        desc.textContent = 'Listen for incoming traffic and measure performance';
        generatorConfig.style.display = 'none';
    }

    log(`Switched to ${mode} mode`, 'info');
}

// ============================================================================
// Server Control
// ============================================================================

function startServer(serverType) {
    log(`Starting ${serverType} server...`, 'info');
    sendMessage('start_server', { server: serverType });
}

function stopServer(serverType) {
    log(`Stopping ${serverType} server...`, 'info');
    sendMessage('stop_server', { server: serverType });
}

function updateServerStatus() {
    sendMessage('get_server_status');
}

function updateServerDots(status) {
    const iperfDot = document.getElementById('iperf-dot');
    const sockperfDot = document.getElementById('sockperf-dot');

    if (status.iperf_running) {
        iperfDot.classList.add('running');
    } else {
        iperfDot.classList.remove('running');
    }

    if (status.sockperf_running) {
        sockperfDot.classList.add('running');
    } else {
        sockperfDot.classList.remove('running');
    }
}

// ============================================================================
// Test Control
// ============================================================================

function updateTestConfig() {
    const testType = document.getElementById('test-type').value;
    const bandwidthGroup = document.getElementById('bandwidth-group');
    const msgsizeGroup = document.getElementById('msgsize-group');

    // Show/hide relevant fields
    if (testType === 'iperf-udp') {
        bandwidthGroup.style.display = 'block';
        msgsizeGroup.style.display = 'none';
    } else if (testType.startsWith('sockperf')) {
        bandwidthGroup.style.display = 'none';
        msgsizeGroup.style.display = 'block';
    } else {
        bandwidthGroup.style.display = 'none';
        msgsizeGroup.style.display = 'none';
    }
}

function startTest() {
    if (currentMode === 'listener') {
        log('Cannot start test in listener mode', 'warning');
        return;
    }

    const testType = document.getElementById('test-type').value;
    const remoteIp = document.getElementById('remote-ip').value;
    const duration = parseInt(document.getElementById('duration').value);
    const bandwidth = document.getElementById('bandwidth').value;
    const msgsize = parseInt(document.getElementById('msgsize').value);

    // Clear previous data
    chartData.labels = [];
    chartData.bandwidth = [];
    chartData.latency = [];
    chartData.latencyP99 = [];
    updateChart();

    isTestRunning = true;
    log(`Starting ${testType} test to ${remoteIp}...`, 'info');

    let messageData = {
        host: remoteIp,
        duration: duration
    };

    // Send appropriate message based on test type
    switch(testType) {
        case 'iperf-tcp':
            sendMessage('start_iperf_client', {
                ...messageData,
                port: 5201,
                udp: false
            });
            break;

        case 'iperf-udp':
            sendMessage('start_iperf_client', {
                ...messageData,
                port: 5201,
                udp: true,
                bandwidth: bandwidth
            });
            break;

        case 'sockperf-pp':
            sendMessage('start_sockperf_pingpong', {
                ...messageData,
                port: 11111,
                msg_size: msgsize
            });
            break;

        case 'sockperf-ul':
            sendMessage('start_sockperf_load', {
                ...messageData,
                port: 11111,
                msg_size: msgsize,
                mps: 10000
            });
            break;

        case 'ping':
            sendMessage('start_ping', {
                host: remoteIp,
                count: duration * 10
            });
            break;
    }

    // Auto-expand graph during test
    if (!isExpanded) {
        toggleExpand();
    }
}

function stopTest() {
    log('Stopping test...', 'info');
    const testType = document.getElementById('test-type').value;

    if (testType.startsWith('iperf')) {
        sendMessage('stop_iperf');
    } else if (testType.startsWith('sockperf')) {
        sendMessage('stop_sockperf');
    } else if (testType === 'ping') {
        sendMessage('stop_ping');
    }

    isTestRunning = false;
}

// ============================================================================
// Data Updates
// ============================================================================

function updateProgress(data) {
    // Update stats
    if (data.bandwidth_mbps !== undefined) {
        const bw = formatBandwidth(data.bandwidth_mbps);
        document.getElementById('stat-bandwidth').textContent = `${bw.value} ${bw.unit}`;
        addChartData('bandwidth', data.bandwidth_mbps);
    }

    if (data.latency_avg_us !== undefined) {
        document.getElementById('stat-latency').textContent = data.latency_avg_us.toFixed(2) + ' μs';
        addChartData('latency', data.latency_avg_us);
    }

    if (data.jitter_ms !== undefined) {
        document.getElementById('stat-jitter').textContent = data.jitter_ms.toFixed(2) + ' ms';
    }

    if (data.lost_percent !== undefined) {
        document.getElementById('stat-loss').textContent = data.lost_percent.toFixed(2) + '%';
    }
}

function updateStats(stats) {
    if (stats.bandwidth_mbps !== undefined) {
        const bw = formatBandwidth(stats.bandwidth_mbps);
        document.getElementById('stat-bandwidth').textContent = `${bw.value} ${bw.unit}`;
        addChartData('bandwidth', stats.bandwidth_mbps);
    }

    if (stats.latency_avg_us !== undefined) {
        document.getElementById('stat-latency').textContent = stats.latency_avg_us.toFixed(2) + ' μs';
        addChartData('latency', stats.latency_avg_us);
    }

    if (stats.latency_p99_us !== undefined) {
        addChartData('latencyP99', stats.latency_p99_us);
    }

    if (stats.jitter_ms !== undefined) {
        document.getElementById('stat-jitter').textContent = stats.jitter_ms.toFixed(2) + ' ms';
    }

    if (stats.lost_percent !== undefined) {
        document.getElementById('stat-loss').textContent = stats.lost_percent.toFixed(2) + '%';
    }
}

// ============================================================================
// Chart Management
// ============================================================================

function initChart() {
    const ctx = document.getElementById('mainChart').getContext('2d');

    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Bandwidth (Mbps)',
                    data: [],
                    borderColor: '#0066CC',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Latency Avg (μs)',
                    data: [],
                    borderColor: '#3385D6',
                    backgroundColor: 'rgba(51, 133, 214, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                },
                {
                    label: 'Latency P99 (μs)',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Bandwidth (Mbps)',
                        color: '#0066CC'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000) {
                                return (value / 1000).toFixed(1) + ' Gbps';
                            }
                            return value.toFixed(0) + ' Mbps';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Latency (μs)',
                        color: '#3385D6'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }

                            // Format bandwidth with appropriate units
                            if (context.datasetIndex === 0) {  // Bandwidth dataset
                                const value = context.parsed.y;
                                if (value >= 1000) {
                                    label += (value / 1000).toFixed(2) + ' Gbps';
                                } else {
                                    label += value.toFixed(2) + ' Mbps';
                                }
                            } else {  // Latency datasets
                                label += context.parsed.y.toFixed(2) + ' μs';
                            }

                            return label;
                        }
                    }
                }
            }
        }
    });
}

function addChartData(type, value) {
    const now = new Date().toLocaleTimeString();

    // Add timestamp if new
    if (chartData.labels.length === 0 || chartData.labels[chartData.labels.length - 1] !== now) {
        chartData.labels.push(now);

        // Keep only last MAX_DATA_POINTS
        if (chartData.labels.length > MAX_DATA_POINTS) {
            chartData.labels.shift();
            chartData.bandwidth.shift();
            chartData.latency.shift();
            chartData.latencyP99.shift();
        }
    }

    // Update appropriate dataset
    if (type === 'bandwidth') {
        chartData.bandwidth[chartData.labels.length - 1] = value;
    } else if (type === 'latency') {
        chartData.latency[chartData.labels.length - 1] = value;
    } else if (type === 'latencyP99') {
        chartData.latencyP99[chartData.labels.length - 1] = value;
    }

    updateChart();
}

function updateChart() {
    if (!mainChart) return;

    mainChart.data.labels = chartData.labels;
    mainChart.data.datasets[0].data = chartData.bandwidth;
    mainChart.data.datasets[1].data = chartData.latency;
    mainChart.data.datasets[2].data = chartData.latencyP99;

    mainChart.update('none');
}

function toggleExpand() {
    isExpanded = !isExpanded;
    const graphPanel = document.getElementById('graph-panel');
    const chartWrapper = document.getElementById('chart-wrapper');
    const expandText = document.getElementById('expand-text');

    if (isExpanded) {
        graphPanel.classList.add('expanded');
        chartWrapper.classList.add('large');
        expandText.textContent = '⛶ Collapse';
    } else {
        graphPanel.classList.remove('expanded');
        chartWrapper.classList.remove('large');
        expandText.textContent = '⛶ Expand';
    }

    // Resize chart
    setTimeout(() => {
        mainChart.resize();
    }, 300);
}

// ============================================================================
// Logging
// ============================================================================

function log(message, type = 'info') {
    const logConsole = document.getElementById('log-console');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;

    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] ${message}`;

    logConsole.appendChild(entry);
    logConsole.scrollTop = logConsole.scrollHeight;

    // Keep only last 100 entries
    while (logConsole.children.length > 100) {
        logConsole.removeChild(logConsole.firstChild);
    }
}

function clearLog() {
    document.getElementById('log-console').innerHTML = '';
}

// ============================================================================
// Export Results
// ============================================================================

function exportResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const results = {
        timestamp: new Date().toISOString(),
        mode: currentMode,
        configuration: {
            test_type: document.getElementById('test-type').value,
            remote_ip: document.getElementById('remote-ip').value,
            duration: document.getElementById('duration').value
        },
        results: {
            bandwidth: document.getElementById('stat-bandwidth').textContent,
            latency: document.getElementById('stat-latency').textContent,
            jitter: document.getElementById('stat-jitter').textContent,
            loss: document.getElementById('stat-loss').textContent
        },
        chart_data: {
            labels: chartData.labels.slice(),
            bandwidth: chartData.bandwidth.slice(),
            latency: chartData.latency.slice(),
            latency_p99: chartData.latencyP99.slice()
        }
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keti-tsn-results-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    log('Results exported to JSON file', 'success');
}

// ============================================================================
// Initialization
// ============================================================================

window.onload = () => {
    log('KETI TSN Traffic Tester initialized', 'info');
    initChart();
    connectWebSocket();
    updateTestConfig();

    // Request server status
    setTimeout(() => {
        updateServerStatus();
    }, 1000);
};
