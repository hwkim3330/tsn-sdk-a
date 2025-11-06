#!/usr/bin/env python3
"""
sockperf Wrapper Module
Runs sockperf tests and parses output in real-time
"""

import subprocess
import threading
import re
import time
import logging
from typing import Optional, Callable, Dict

logger = logging.getLogger(__name__)

class SockPerfTool:
    """Wrapper for sockperf command line tool"""

    def __init__(self):
        self.process: Optional[subprocess.Popen] = None
        self.thread: Optional[threading.Thread] = None
        self.running = False
        self.callback: Optional[Callable] = None
        self.stats = {
            "latency_avg_us": 0,
            "latency_min_us": 0,
            "latency_max_us": 0,
            "latency_p50_us": 0,
            "latency_p95_us": 0,
            "latency_p99_us": 0,
            "packets_sent": 0,
            "packets_received": 0,
            "packet_loss": 0
        }

    def set_callback(self, callback: Callable):
        """Set callback for real-time updates"""
        self.callback = callback

    def _notify(self, event: str, data: Dict):
        """Send callback notification"""
        if self.callback:
            try:
                self.callback(event, data)
            except Exception as e:
                logger.error(f"Callback error: {e}")

    def start_server(self, port: int = 11111):
        """Start sockperf server"""
        if self.running:
            logger.warning("sockperf server already running")
            return False

        try:
            cmd = ["sockperf", "server", "-p", str(port)]
            self.process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1
            )
            self.running = True
            logger.info(f"sockperf server started on port {port}")
            return True
        except Exception as e:
            logger.error(f"Failed to start sockperf server: {e}")
            return False

    def start_ping_pong(self, host: str = "127.0.0.1", port: int = 11111,
                       duration: int = 10, msg_size: int = 64):
        """
        Start sockperf ping-pong test

        Args:
            host: Server hostname/IP
            port: Server port
            duration: Test duration in seconds
            msg_size: Message size in bytes
        """
        if self.running:
            logger.warning("sockperf test already running")
            return False

        try:
            cmd = [
                "sockperf", "ping-pong",
                "-i", host, "-p", str(port),
                "-t", str(duration),
                "--msg-size", str(msg_size)
            ]

            self.running = True
            self.thread = threading.Thread(
                target=self._run_test,
                args=(cmd,)
            )
            self.thread.daemon = True
            self.thread.start()

            logger.info(f"sockperf ping-pong started: {' '.join(cmd)}")
            return True

        except Exception as e:
            logger.error(f"Failed to start sockperf test: {e}")
            self.running = False
            return False

    def start_under_load(self, host: str = "127.0.0.1", port: int = 11111,
                        duration: int = 10, msg_size: int = 64, mps: int = 10000):
        """
        Start sockperf under-load test

        Args:
            host: Server hostname/IP
            port: Server port
            duration: Test duration in seconds
            msg_size: Message size in bytes
            mps: Messages per second rate
        """
        if self.running:
            logger.warning("sockperf test already running")
            return False

        try:
            cmd = [
                "sockperf", "under-load",
                "-i", host, "-p", str(port),
                "-t", str(duration),
                "--msg-size", str(msg_size),
                "--mps", str(mps)
            ]

            self.running = True
            self.thread = threading.Thread(
                target=self._run_test,
                args=(cmd,)
            )
            self.thread.daemon = True
            self.thread.start()

            logger.info(f"sockperf under-load started: {' '.join(cmd)}")
            return True

        except Exception as e:
            logger.error(f"Failed to start sockperf test: {e}")
            self.running = False
            return False

    def _run_test(self, cmd: list):
        """Internal test runner with output parsing"""
        try:
            self.process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1
            )

            output_lines = []

            # Read output line by line
            for line in self.process.stdout:
                output_lines.append(line)
                logger.debug(f"sockperf: {line.strip()}")

                # Parse real-time updates
                self._parse_line(line)

            # Wait for completion
            self.process.wait()

            # Parse final summary
            full_output = ''.join(output_lines)
            self._parse_summary(full_output)

            self._notify("test_complete", self.stats)

        except Exception as e:
            logger.error(f"sockperf test error: {e}")
            self._notify("error", {"message": str(e)})
        finally:
            self.running = False
            self.process = None

    def _parse_line(self, line: str):
        """Parse sockperf output line"""
        try:
            # Example: sockperf: Total 100 messages sent in 10.001 sec
            if "messages sent" in line:
                match = re.search(r'Total\s+(\d+)\s+messages', line)
                if match:
                    self.stats["packets_sent"] = int(match.group(1))

            # Example: sockperf: Total 100 messages received
            if "messages received" in line:
                match = re.search(r'Total\s+(\d+)\s+messages', line)
                if match:
                    self.stats["packets_received"] = int(match.group(1))

        except Exception as e:
            logger.debug(f"Failed to parse line: {e}")

    def _parse_summary(self, output: str):
        """Parse sockperf summary statistics"""
        try:
            # Example summary:
            # sockperf: Summary: Latency is 12.345 usec
            # sockperf: Summary: Min latency is 5.678 usec
            # sockperf: Summary: Max latency is 45.678 usec

            # Average latency
            match = re.search(r'Summary:\s+Latency is\s+(\d+\.?\d*)\s+usec', output)
            if match:
                self.stats["latency_avg_us"] = float(match.group(1))

            # Min latency
            match = re.search(r'Min latency is\s+(\d+\.?\d*)\s+usec', output)
            if match:
                self.stats["latency_min_us"] = float(match.group(1))

            # Max latency
            match = re.search(r'Max latency is\s+(\d+\.?\d*)\s+usec', output)
            if match:
                self.stats["latency_max_us"] = float(match.group(1))

            # Percentiles
            match = re.search(r'50\.0%.*?(\d+\.?\d*)', output)
            if match:
                self.stats["latency_p50_us"] = float(match.group(1))

            match = re.search(r'95\.0%.*?(\d+\.?\d*)', output)
            if match:
                self.stats["latency_p95_us"] = float(match.group(1))

            match = re.search(r'99\.0%.*?(\d+\.?\d*)', output)
            if match:
                self.stats["latency_p99_us"] = float(match.group(1))

            # Calculate packet loss
            if self.stats["packets_sent"] > 0:
                lost = self.stats["packets_sent"] - self.stats["packets_received"]
                self.stats["packet_loss"] = (lost / self.stats["packets_sent"]) * 100

            logger.info(f"sockperf test complete: {self.stats}")

        except Exception as e:
            logger.error(f"Error parsing sockperf output: {e}")

    def stop(self):
        """Stop running test"""
        self.running = False
        if self.process:
            try:
                self.process.terminate()
                self.process.wait(timeout=2)
            except:
                self.process.kill()
            self.process = None

    def get_stats(self) -> Dict:
        """Get current statistics"""
        return self.stats.copy()


# Quick test
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    def callback(event, data):
        print(f"Event: {event}, Data: {data}")

    # Test ping-pong
    tool = SockPerfTool()
    tool.set_callback(callback)

    print("Starting sockperf ping-pong test...")
    tool.start_ping_pong(host="127.0.0.1", duration=5)

    # Wait for completion
    while tool.running:
        time.sleep(0.5)

    print(f"Final stats: {tool.get_stats()}")
