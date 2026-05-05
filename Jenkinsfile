pipeline {
  agent any

  stages {

    stage('Clone Code') {
      steps {
        git branch: 'main',
            url: 'https://github.com/PrathameshDangore/Devops-Project.git'
      }
    }

    stage('Build Docker Images') {
      steps {
        sh 'docker compose build'
      }
    }

    stage('Stop Old Containers') {
      steps {
        sh 'docker compose down'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose up -d'
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