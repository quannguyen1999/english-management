# Navigate into the accounts directory and run Maven install
# shellcheck disable=SC2164
# Define an array containing the folder names
folders=(
  "prime-be-eureka"
  "prime-be-gateway"
  "prime-be-user"
  "prime-be-project"
)

echo "move one step folder folder"
cd ../

# Install Library + Jar
echo "Start Install File BE Jar"
for folder in "${folders[@]}"; do
    echo "Executing mvn clean install in $folder folder..."
    cd "../$folder"  # Change directory to the folder
    mvn install -DskipTests -Dmaven.test.skip=true
    echo "Done with $folder folder."
done
echo "End Install File Jar"

# Install Docker Image
echo "Start Install Docker image Jar"
for folder in "${folders[@]}"; do
    echo "Executing docker build . -t quannguyen1999/$folder folder..."
    cd "../$folder"  # Change directory to the folder
    docker build . -t quannguyen1999/$folder
    echo "Done with $folder folder."
done
echo "End Install Docker image Jar"

echo "Start Install File FE Jar"
echo "Executing docker build . -t quannguyen1999/prime-fe-management folder..."
cd "../prime-fe-management"  # Change directory to the folder
docker build . -t quannguyen1999/prime-fe-management
echo "Done with prime-fe-management folder."