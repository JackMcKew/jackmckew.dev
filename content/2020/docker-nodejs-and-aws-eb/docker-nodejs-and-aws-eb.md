Title: Deploy a Node Web App to AWS Elastic Beanstalk with Docker
Date: 2020-12-03
Author: Jack McKew
Category: Software
Tags: software

We've gone through how to use Docker to help develop our web applications, now we want to be able to deploy them out in the wild. Let's use Amazon Web Services (AWS) Elastic Beanstalk to do this. Note that there is a free tier of AWS that we can make use of! We will also be making use of GitHub actions to automate the CI/CD, in which it'll build the Docker container to test our web application, and then deploy it to AWS automatically.

Let's deploy the application we built in a previous post [Develop and Deploy with Docker](https://jackmckew.dev/develop-and-deploy-with-docker.html). It's the default output from `create-react-app`, but we can further develop this and it'll update as soon as we push to the repository. This post assumes that we've already set up the `create-react-app` and dockerized it as such in the previous post.

This post is apart of a series on Docker/Kubernetes, find the other posts at:

- [Intro to Docker](https://jackmckew.dev/intro-to-docker.html)
- [Develop and Develop with Docker](https://jackmckew.dev/develop-and-deploy-with-docker.html)
- [Develop and Develop Multi Container Applications](https://jackmckew.dev/develop-and-deploy-multi-container-applications.html)
- [Intro to Kubernetes](https://jackmckew.dev/intro-to-kubernetes.html)
- [Developing with Kubernetes](https://jackmckew.dev/developing-with-kubernetes.html)
- [Deploying with Kubernetes](https://jackmckew.dev/deploying-with-kubernetes.html)

## GitHub Action

Let's begin by setting up the CI/CD workflow in GitHub Actions. We create a yml file in our repository under `.github/workflows/build-docker.yml`. To step through the actions we want to do each time a new version is pushed into our repository are:

1. Clone the latest version of the repository
2. Build the development Docker container
3. Execute tests on our web app and fail if there's any failing tests
4. Generate a packaged version to deploy
5. Deploy to AWS

For the most part, we will be making use of `run` commands, as if we are interacting with the terminal in the runtime of ubuntu (Linux). Otherwise, we can make use of pre-made actions from the marketplace. One note to be made is that the AWS Elastic Beanstalk application has been set up to run specifically on Docker, and as such we need to upload the relevant Dockerfile (production) along with any assets.

The contents of the Github Action in whole will be:

``` yaml
name: Test & Deploy
on:
  push:
    branches:
      - master

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Latest Repo
        uses: actions/checkout@master

      - name: Build Dev Docker Image
        run: docker build -t jackmckew/docker-react-dev -f Dockerfile.dev .

      - name: Run Test Suite
        run: docker run -e CI=true jackmckew/docker-react-dev npm run test -- --coverage

      # Zip Dockerfile for upload
      - name: Generate Deployment Package
        run: zip -r deploy.zip * -x "**node_modules**"

      - name: Get Timestamp
        uses: gerred/actions/current-time@master
        id: current-time

      - name: Run String Replace
        uses: frabert/replace-string-action@master
        id: format-time
        with:
          pattern: '[:\.]+'
          string: "${{ steps.current-time.outputs.time }}"
          replace-with: "-"
          flags: "g"

      # Deploy to AWS
      - name: Install Dependencies & Deploy to AWS
        run: |
          sudo npm install -g beanstalk-deploy --unsafe-perm
          sudo AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID}} AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY}} beanstalk-deploy "docker-react" "DockerReact-env-1" "docker-react-${{ steps.format-time.outputs.replaced }}" "us-east-2" deploy.zip
```

> There is an action for [beanstalk-deploy](https://github.com/marketplace/actions/beanstalk-deploy), although it didn't work properly, and as such the workaround is to use the npm package on it's own.

## AWS Elastic Beanstalk

Next up we need to set up our instance of Elastic Beanstalk on AWS. We need to complete a few steps:

1. Create a new application & environment in AWS Elastic Beanstalk
2. Create API keys for our GitHub Action (these go in as secrets)

Since the previous post relies upon a multi-stage Dockerfile to build the app and run the app within nginx, we must ensure to use the platform `Docker running on 64bit Amazon Linux/2.15.2`, as `Docker running on Amazon Linux 2`, [does not support multi-stage Dockerfiles](https://stackoverflow.com/questions/61462646/unable-to-deploy-docker-application-in-elasticbeanstalk-using-travis-ci). Furthermore, we exposed the ports in the Dockerfile through docker-compose or the Docker CLI previously, we can also do this by adding the command `EXPOSE 80` in the production Dockerfile.

Once we've set the application, and the keys as secrets, we are now able to push into our repository, and this will update our application on AWS Elastic Beanstalk.

## Conclusion

This is a production grade workflow for developing web applications in React and deploying to AWS. Find the complete repository of this post over at: <https://github.com/JackMcKew/docker-react>