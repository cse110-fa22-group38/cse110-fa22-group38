## Phase 1 CI/CD Pipeline

For the phase 1 of the ci/cd pipeline, we have been using the gtihub actions to deploy our piepline.

Right now the pipeline is primarily for checks when we are pushing to main, however we have been working on respective backend and frontend branches and continuously testing out codes on it.

For the code linting, we are doing it locally in our editors. We have installed linters like prettier on everyone's machine so everyone has code linting present.

For documentation generation, we have been using JSdocs which creates the API documentation for us.

We have enable branch protections for the main branch according to which all the people are not able to push their code into the main branch without having a PR (pull request reviewed by either Divyam or John who are the group leaders).

For the coverage viewers, we are using codacy which tells us the code coverage (we are almost done with the setup of the same for github actions).

This is primarily for when we are pushing the code on the main branch or the backend/frontend branch.

We are using jest testing framework for the JEST testing framework (We are currently in process of deploying it on github)
