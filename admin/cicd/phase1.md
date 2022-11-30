# CI/CD Pipeline 
- We have a CI/CD pipeline which has the following features:
  - Linting : Done locally on the editor
  - Unit tests : JEST testing framework which runs the unit tests on the main branch. 
  - Codacy : We have a code quality checker from the codacy which has a separate github action
  - HTML Validator for the Frontend
  - JSDocs generator for the documentation generation
  

## Workflow Pipeline
The whole pipeline is that the we have 4 yml files for the github actions. 

- Build.yml
  - Creates a node instance in github at node version 19.0.0
  - Is responsible for running the tests

- Codacy Analysis
  - Responsible for running codacy code checker 
  
- JSdoc
  - Creates a jsdocs for our code
  - Recursively checks the node-express folder for the JS files and creates the documentation

- Frontend Checks
  - Runs the html validator for the checking the frontend 

## Process of pushing
- We have branch protection on the main branch that prevents anyone to push to main without submitting a pull request and a code review by Divyam
- We have the workflows running
- After the code passes with manual quality check and conflicts and the workflows run on github actions, the code is pushed to the branch
