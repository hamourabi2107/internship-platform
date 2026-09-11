pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Spring Boot services') {
            steps {
                script {
                    def services = ['eureka-server', 'api-gateway', 'student-service', 'internship-service', 'company-service']
                    for (service in services) {
                        dir(service) {
                            if (isUnix()) {
                                sh 'mvn -B -DskipTests clean package'
                            } else {
                                bat 'call mvnw.cmd -B -DskipTests clean package'
                            }
                        }
                    }
                }
            }
        }

        stage('Build Angular frontend') {
            steps {
                dir('frontend') {
                    script {
                        if (isUnix()) {
                            sh 'npm ci && npm run build'
                        } else {
                            bat 'call npm ci && call npm run build'
                        }
                    }
                }
            }
        }

        stage('Build Docker images') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'docker compose build'
                    } else {
                        bat 'docker compose build'
                    }
                }
            }
        }
    }
}
