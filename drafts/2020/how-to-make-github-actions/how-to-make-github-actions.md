Title: How to Make GitHub Actions
Date: 2020-04-xx
Author: Jack McKew
Category: CICD
Tags: cicd

From a recent post on this blog on how to use [GitHub Actions to easily integrate CI/CD into your repository](https://jackmckew.dev/github-actions-for-cicd.html), this post will go into how to create your own GitHub Action!

This post was inspired from developing a few GitHub Actions of my own, which I recently released!

## PyInstaller GitHub Actions

Do you ever want to share your Python code with others, but they don't have Python installed?

You can now easily package your code up as an executable (*.exe) file with GitHub Actions!

- Windows: <https://github.com/marketplace/actions/pyinstaller-windows>
- Linux: <https://github.com/marketplace/actions/pyinstaller-linux>

Once activated on your repository, each time you push, the action will be kicked off and upload a packaged application to your repository.

![PyInstaller Actions]({static img/pyinstaller-action.png})

## Interrogate GitHub Action

Interrogate checks your docstring coverage, integrate it easily into your CI workflow with GitHub Actions.

<https://github.com/marketplace/actions/python-interrogate-check>

## How These Actions were Made

Now let's get into how these actions were made!

