pipeline {
  agent any

  stages {

    stage('Clone Code') {
      steps {
        git branch: 'main',
            url: 'https://github.com/PrathameshDangore/3tier-Project.git'
      }
    }

    stage('Cleanup') {
      steps {
        sh '''
          docker rm -f mariadb frontend backend || true
          docker network prune -f || true
        '''
      }
    }

    stage('Build Docker Images') {
      steps {
        sh '''
          cd $WORKSPACE
          docker-compose build
        '''
      }
    }

    stage('Stop Old Containers') {
      steps {
        sh '''
          cd $WORKSPACE
          docker-compose down || true
        '''
      }
    }

    stage('Deploy') {
      steps {
        sh '''
          cd $WORKSPACE
          docker-compose up -d
        '''
      }
    }

  }

  post {
    success {
      echo 'Deployment Successful!'
    }
    failure {
      echo 'Deployment Failed!'
    }
  }
}