#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Docker Hub username
DOCKER_USERNAME="quannguyen1999"

# Function to check Docker Hub login
check_docker_login() {
    if ! docker info | grep -q "Username: ${DOCKER_USERNAME}"; then
        echo -e "${YELLOW}You are not logged in to Docker Hub as ${DOCKER_USERNAME}${NC}"
        echo -e "${YELLOW}Please enter your Docker Hub credentials:${NC}"
        docker login
        if [ $? -ne 0 ]; then
            echo -e "${RED}Docker login failed. Please try again.${NC}"
            exit 1
        fi
    fi
    echo -e "${GREEN}Successfully logged in to Docker Hub${NC}"
}

# Function to push an image
push_image() {
    local image_name=$1
    local full_image_name="${DOCKER_USERNAME}/${image_name}"
    
    # Check if image exists
    if ! docker image inspect ${full_image_name}:latest &>/dev/null; then
        echo -e "${RED}Error: Image ${full_image_name}:latest does not exist${NC}"
        return 1
    fi
    
    # Push to Docker Hub
    echo -e "${BLUE}Pushing image: ${full_image_name}:latest${NC}"
    docker push ${full_image_name}:latest
    echo -e "${GREEN}Successfully pushed ${full_image_name}:latest${NC}"
}

# Main script
echo -e "${BLUE}Starting Docker image push process...${NC}"

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# Execute install_mvn_images.sh first
echo -e "${BLUE}Executing install_mvn_images.sh to build and install images...${NC}"
./install_mvn_images.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build and install images. Aborting push process.${NC}"
    exit 1
fi
echo -e "${GREEN}Successfully built and installed all images${NC}"

# Check Docker Hub login
check_docker_login

# Push each image
echo -e "${BLUE}Pushing latest images...${NC}"
push_image "prime-be-eureka"
push_image "prime-be-gateway"
push_image "prime-be-project"
push_image "prime-be-user"
push_image "prime-fe-management"

echo -e "${GREEN}All images pushed successfully to Docker Hub!${NC}" 