import sys

# If active, sys.prefix will point to the venv folder
print("Active Venv:", sys.prefix)
# Returns True if running in a virtual environment
print("In Venv:", sys.prefix != sys.base_prefix)
