pipeline {
    agent any
    
    environment {
        FRONTEND_IMAGE = 'chatapp-frontend'
        BACKEND_IMAGE = 'chatapp-backend'
        MONGO_IMAGE = 'mongo:latest'
        NETWORK_NAME = 'chat-network'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/ManishSingh-01/full-stack_chatApp.git'
            }
        }
        
        stage('Stop Old Containers') {
            steps {
                script {
                    echo 'Stopping and removing old containers...'
                    sh '''
                        docker stop chatapp-frontend chatapp-backend chatapp-mongo || true
                        docker rm chatapp-frontend chatapp-backend chatapp-mongo || true
                    '''
                }
            }
        }
        
        stage('Build Backend Image') {
            steps {
                script {
                    echo 'Building Backend Docker image...'
                    sh '''
                        cd backend
                        docker build -t ${BACKEND_IMAGE}:latest .
                    '''
                }
            }
        }
        
        stage('Build Frontend Image') {
            steps {
                script {
                    echo 'Building Frontend Docker image...'
                    sh '''
                        cd frontend
                        docker build -t ${FRONTEND_IMAGE}:latest .
                    '''
                }
            }
        }
        
        stage('Create Network') {
            steps {
                script {
                    echo 'Creating Docker network...'
                    sh '''
                        docker network create ${NETWORK_NAME} || true
                    '''
                }
            }
        }
        
        stage('Deploy MongoDB') {
            steps {
                script {
                    echo 'Deploying MongoDB container...'
                    sh '''
                        docker run -d \
                            --name mongo \
                            --network ${NETWORK_NAME} \
                            -p 27017:27017 \
                            -e MONGO_INITDB_ROOT_USERNAME=root \
                            -e MONGO_INITDB_ROOT_PASSWORD=admin \
                            -v mongodb_data:/data/db \
                            --restart unless-stopped \
                            ${MONGO_IMAGE}
                    '''
                    // Wait for MongoDB to be ready
                    sh 'sleep 10'
                }
            }
        }
        
        stage('Deploy Backend') {
            steps {
                script {
                    echo 'Deploying Backend container...'
                    sh '''
                        docker run -d \
                            --name backend \
                            --network ${NETWORK_NAME} \
                            -p 5001:5001 \
                            --env-file .env \
                            --restart unless-stopped \
                            ${BACKEND_IMAGE}:latest
                    '''
                    // Wait for backend to be ready
                    sh 'sleep 5'
                }
            }
        }
        
        stage('Deploy Frontend') {
            steps {
                script {
                    echo 'Deploying Frontend container...'
                    sh '''
                        docker run -d \
                            --name frontend \
                            --network ${NETWORK_NAME} \
                            -p 8081:80 \
                            -e BACKEND_URL=http://backend:5001 \
                            --restart unless-stopped \
                            ${FRONTEND_IMAGE}:latest
                    '''
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    echo 'Verifying all containers are running...'
                    sh '''
                        echo "=== Container Status ==="
                        docker ps --filter  "name=frontend" --filter "name=backend" --filter "name=mongo"
                        echo ""
                        echo "=== Network Info ==="
                        docker network inspect ${NETWORK_NAME}
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment completed successfully!'
            sh '''
                echo "All services are up and running:"
                docker ps --filter "name=frontend" --filter "name=backend" --filter "name=mongo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
            '''
        }
        failure {
            echo 'Deployment failed. Checking logs...'
            sh '''
                echo "=== Backend Logs ==="
                docker logs backend || true
                echo ""
                echo "=== Frontend Logs ==="
                docker logs frontend || true
                echo ""
                echo "=== MongoDB Logs ==="
                docker logs mongo || true
            '''
        }
        always {
            echo 'Cleaning up unused Docker resources...'
            sh 'docker image prune -f || true'
        }
    }
}
