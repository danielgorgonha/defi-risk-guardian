#!/usr/bin/env python3
"""
Test runner script for the DeFi Risk Guardian backend
"""
import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running {description}:")
        print(f"Return code: {e.returncode}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        return False

def main():
    """Main test runner"""
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    print("🚀 DeFi Risk Guardian - Test Runner")
    print("=" * 60)
    
    # Check if we're in a virtual environment
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Not in a virtual environment")
        print("Consider activating your virtual environment first")
    
    # Install test dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        print("❌ Failed to install dependencies")
        return 1
    
    # Run unit tests
    print("\n🧪 Running Unit Tests...")
    unit_success = run_command(
        "pytest tests/unit/ -v --tb=short --cov=app --cov-report=term-missing",
        "Unit Tests"
    )
    
    # Run integration tests
    print("\n🔗 Running Integration Tests...")
    integration_success = run_command(
        "pytest tests/integration/ -v --tb=short",
        "Integration Tests"
    )
    
    # Run all tests with coverage
    print("\n📊 Running All Tests with Coverage...")
    all_tests_success = run_command(
        "pytest tests/ -v --tb=short --cov=app --cov-report=html --cov-report=term-missing",
        "All Tests with Coverage Report"
    )
    
    # Run specific test categories
    print("\n🏷️  Running Tests by Category...")
    
    # Unit tests only
    run_command("pytest -m unit -v", "Unit Tests Only")
    
    # Integration tests only
    run_command("pytest -m integration -v", "Integration Tests Only")
    
    # Slow tests only
    run_command("pytest -m slow -v", "Slow Tests Only")
    
    # Summary
    print("\n" + "="*60)
    print("📋 TEST SUMMARY")
    print("="*60)
    
    if unit_success:
        print("✅ Unit Tests: PASSED")
    else:
        print("❌ Unit Tests: FAILED")
    
    if integration_success:
        print("✅ Integration Tests: PASSED")
    else:
        print("❌ Integration Tests: FAILED")
    
    if all_tests_success:
        print("✅ All Tests: PASSED")
        print("\n🎉 All tests completed successfully!")
        print("📁 Coverage report generated in: htmlcov/index.html")
        return 0
    else:
        print("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
