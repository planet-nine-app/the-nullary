#!/bin/bash

# Run second StackChat instance with different private key
export PRIVATE_KEY="1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

echo "🚀 Starting second StackChat instance with custom private key..."
echo "Private key: ${PRIVATE_KEY:0:16}..."

npm run tauri dev