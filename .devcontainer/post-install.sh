#!/bin/bash

# Post-installation script for dev container
# Install unzip dependency required by bun upgrade

echo "Installing unzip dependency..."
apt-get update
apt-get install -y unzip

echo "Post-installation completed successfully!"



