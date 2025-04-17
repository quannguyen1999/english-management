#User JDK 17
FROM openjdk:17-jdk-slim

#Author Maintain
MAINTAINER quannguyen

# Install CURL
RUN apt-get update && apt-get install -y curl

#Copy File Jar to Docker
COPY target/eng-be-chat-0.0.1-SNAPSHOT.jar eng-be-chat-0.0.1-SNAPSHOT.jar

#Excute command to run Spring boot
#Cmd Example: java -jar target/eng-be-chat-0.0.1-SNAPSHOT.jar
ENTRYPOINT [ \
    "java", \
    "-jar", \
    "eng-be-chat-0.0.1-SNAPSHOT.jar" \
]
