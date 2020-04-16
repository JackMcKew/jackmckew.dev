Title: Github Actions for CI/CD
Date: 2020-04-15
Author: Jack McKew
Category: Software, CICD
Tags: software, cicd

Recently the [Python Bytes Awesome Package List](https://github.com/JackMcKew/awesome-python-bytes) moved to it's own repository from the [blog post](https://jackmckew.dev/python-bytes-awesome-package-list.html#python-bytes-awesome-package-list). This was done to enable the community be able to contribute their packages that they thought were awesome, which was a success with many pull requests already merged.

After getting a taste of CI/CD principles with [Travis CI](https://travis-ci.com/) in building this blog, an idea to integrate some CI/CD with the awesome package list repository to ensure spelling errors, broken links, etc are all checked automatically. This was a great opportunity to try out [Github Actions](https://github.com/features/actions), so then all the resources/dependencies live in one place, Github.

Initially, the things to automate were:

- Checking the spelling
- Checking all the links work

Perfect, this is should be a gentle introduction to Github Actions.

# Action Marketplace

One amazing feature of Github Actions is that Github hosts a 'marketplace' for actions, <https://github.com/marketplace?type=actions>. This is awesome, because now you can just search for pre-made actions which will automate. In comparison to other CI services (let me know if there is anything similar), where you have to scour the internet looking for a post or question by someone else and piece together the action yourself.

The actions I ended up using were:

- [Check Spelling (JS, Vue, HTML, Markdown, Text)](https://github.com/marketplace/actions/check-spelling-js-vue-html-markdown-text)
- [Link Checker](https://github.com/marketplace/actions/link-checker)

Even better is most of the actions in marketplace come with a `Usage` section, which is a directly example you can copy/paste into the repository and it just works.

# Action Format (.yaml)

A Github Action is defined with a `<action_name>.yaml` file which must be placed within `.github/workflows` from the base of the repository. As many actions as you want can be placed in this folder, and will subsequently run when triggered.

The base structure of a `link_checker.yaml` file is:

``` yaml
name: Check links
on: push
jobs:
  linkChecker:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Link Checker
      id: lc
      uses: peter-evans/link-checker@v1
      with:
        args: -v -r *
    - name: Fail if there were link errors
      run: exit ${{ steps.lc.outputs.exit_code }}
```

To break this down:

|Field|Use|
|---|---|
|name|Name of the action|
|on|The trigger to run the action (runs whenever a push happens in this example)|
|jobs|What to run when triggered|
|linkChecker|This is a job name|
|runs-on|The operating system to run on|
|steps|Steps to take once the operating system is set up|
|uses|What action to use from the marketplace (or custom specified)|

The biggest part of the action, is what the trigger is. Which the documentation behind this is amazing, see this at: <https://help.github.com/en/actions/reference/events-that-trigger-workflows>.

# Actions on Pull Request

The original reason for implementing CI/CD is to not only check the spelling & links in the content that the owner contributes, we also want it to run on pull requests from other users. This is captured within an issue (with solution) at: <https://github.com/JackMcKew/awesome-python-bytes/issues/9>. The workflow for someone else to contribute to the repository is:

> Fork repository > Make changes > Submit Pull Request with changes > Check changes > Merge into repository

When the action was first set up for actions to run on pull requests, it kept throwing an error:

``` bash
The process '/usr/bin/git' failed with exit code 1
```

This was determined to be intentional design by Github as a mitigation against the possibility that a bad actor could open PRs against your repo and do things like list out secrets or just run up a large bill (once we start charging) on your account.

After speaking with [Hamel Husain](https://twitter.com/HamelHusain) from Github on Twitter, he sent some great resources in the solution he found around this:

- [Fastpages Actions](https://fastpages.fast.ai/actions/markdown/2020/03/06/fastpages-actions.html)
- [Chatops.yaml](https://github.com/fastai/fastpages/blob/master/.github/workflows/chatops.yaml)
- [Github-Script](https://github.com/actions/github-script#comment-on-an-issue)

Essentially, to take 'ownership' of the changes presented in a pull request, the owner (or authorized contributor) drops a comment with a specific command (eg, `/check-pr`), which triggers an action. This workflow ended up like:

> PR Submitted > Owner/Contributor comments keywords (eg `/check-pr`) > Action triggers > Clones PR > Runs neccessary Actions > Comments back on PR results

For the Awesome Python Bytes, the action to cover this workflow ended up as ([source](https://github.com/JackMcKew/awesome-python-bytes/blob/master/.github/workflows/chatops.yaml)):

``` yaml
name: Trigger Checks on Fork
on: [issue_comment]

jobs:
  label-pr:
    runs-on: ubuntu-latest
    steps:
      - name: listen for PR Comments
        uses: machine-learning-apps/actions-chatops@master
        with:
          APP_PEM: ${{ secrets.APP_PEM }}
          APP_ID: ${{ secrets.APP_ID }}
          TRIGGER_PHRASE: "/check-pr"
        env: # you must supply GITHUB_TOKEN
          GITHUB_TOKEN: ${{ secrets.manual_github_token }}
        id: prcomm
        # This step clones the branch of the PR associated with the triggering phrase, but only if it is triggered.
      - name: clone branch of PR
        if: steps.prcomm.outputs.BOOL_TRIGGERED == 'true'
        uses: actions/checkout@master
        with:
          ref: ${{ steps.prcomm.outputs.SHA }}

        # This step is a toy example that illustrates how you can use outputs from the pr-command action
      - name: print variables
        if: steps.prcomm.outputs.BOOL_TRIGGERED == 'true'
        run: echo "${USERNAME} made a triggering comment on PR# ${PR_NUMBER} for ${BRANCH_NAME}"
        env:
          BRANCH_NAME: ${{ steps.prcomm.outputs.BRANCH_NAME }}
          PR_NUMBER: ${{ steps.prcomm.outputs.PULL_REQUEST_NUMBER }}
          USERNAME: ${{ steps.prcomm.outputs.COMMENTER_USERNAME }}

      - name: Check Spelling
        uses: UnicornGlobal/spellcheck-github-actions@master

      - name: Link Checker
        id: lc
        uses: peter-evans/link-checker@v1
        with:
          args: -v -r *
      - name: Fail if there were link errors
        run: exit ${{ steps.lc.outputs.exit_code }}

      - name: Comment on PR if checks pass
        if: success()
        uses: actions/github-script@0.9.0
        with:
          github-token: ${{secrets.manual_github_token}}
          script: |
            github.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '👋 All checks passed!'
            })

      - name: Comment on PR if checks fail
        if: failure()
        uses: actions/github-script@0.9.0
        with:
          github-token: ${{secrets.manual_github_token}}
          script: |
            github.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: 'Some checks failled :(, check Github Actions for more details.'
            })

```
