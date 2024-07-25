Title: ML Agents for Unity on Apple Silicon (M1/M2/M3)
Date: 2024-07-25
Author: Jack McKew
Category: Python, Data Science
Tags: python, machine learning, ai

If you're like me, you found this blog post likely after struggling to get ML agents set up and working a Mac M1/M2/M3, here's hoping what I found that works for me, works for you!

## Clone the ml-agents repo

Ensure you have the ml-agents repo cloned locally! This can be found on <https://github.com/Unity-Technologies/ml-agents>

## Miniconda

Miniconda was set up through the installation instructions listed on the website for Miniconda3 macOS Apple M1 64-bit pkg:

<https://docs.conda.io/en/latest/miniconda.html>

Following this, the conda-forge is added as a channel (instructions from <https://conda-forge.org/docs/user/introduction.html>):

``` sh
conda config --add channels conda-forge
conda config --set channel_priority strict
```

## Conda environment

Big thank you to this github thread (and user @automata) for finally leading me down a successful path <https://github.com/Unity-Technologies/ml-agents/issues/5797>:

```sh
conda create -n mlagents python==3.10.7
```

> Ensure to download the release specifically that you are targetting which are managed by branches on the repo. IE <https://github.com/Unity-Technologies/ml-agents/tree/latest_release>. If you are using the gh CLI `gh repo clone Unity-Technologies/ml-agents -- --branch release_20`

Next we need to edit `setup.py` found in `ml-agents-release_20/ml-agents/setup.py`, specifically line 71 to:

```python
"torch>=1.8.0,<=1.12.0;(platform_system!='Windows' and python_version>='3.9')"
```

Now we install the ml-agents package (which has a dependancy of torch) through the locally edited version:

`pip install -e /Users/jackmckew/Unity/ml-agents-release_20/ml-agents`

Theoretically, this is where we should've been done and been able to run `mlagents-learn` without any more problems, but that wasn't the case. The next error we run into is:

`TypeError: Descriptors cannot not be created directly.`

Which was resolved through <https://stackoverflow.com/questions/72441758/typeerror-descriptors-cannot-not-be-created-directly>

```sh
pip install protobuf~=3.20
```

> Update February 2024, after following my own guide on a Mac M3, I did not need face any further errors listed here

Which gets us past the last error, and unfortunately onto the next.

> Interestingly, if you use pip to uninstall grpcio and conda to reinstall before you downgrade protobuf, this skips the rest of these issues and starts working

`ImportError: dlopen(/Users/jackmckew/miniconda3/envs/mlagentstest/lib/python3.10/site-packages/grpc/_cython/cygrpc.cpython-310-darwin.so, 0x0002): symbol not found in flat namespace '_CFRelease'`

Which was resolved through <https://stackoverflow.com/questions/72620996/apple-m1-symbol-not-found-cfrelease-while-running-python-app>

```sh
pip uninstall grpcio -y
conda install grpcio -y
```

While writing this blog post, I tried to go through my notes that I took while going through this, and interestingly didn't need to downgrade numpy after going the process the first time, but I know I definitely did once, so this is how I resolved that floating number issue.

`pip install "numpy<1.24"`

Finally we can run:

`mlagents-learn`

To be met with this glorious screen

```md
            ┐  ╖
        ╓╖╬│╡  ││╬╖╖
    ╓╖╬│││││┘  ╬│││││╬╖
 ╖╬│││││╬╜        ╙╬│││││╖╖                               ╗╗╗
 ╬╬╬╬╖││╦╖        ╖╬││╗╣╣╣╬      ╟╣╣╬    ╟╣╣╣             ╜╜╜  ╟╣╣
 ╬╬╬╬╬╬╬╬╖│╬╖╖╓╬╪│╓╣╣╣╣╣╣╣╬      ╟╣╣╬    ╟╣╣╣ ╒╣╣╖╗╣╣╣╗   ╣╣╣ ╣╣╣╣╣╣ ╟╣╣╖   ╣╣╣
 ╬╬╬╬┐  ╙╬╬╬╬│╓╣╣╣╝╜  ╫╣╣╣╬      ╟╣╣╬    ╟╣╣╣ ╟╣╣╣╙ ╙╣╣╣  ╣╣╣ ╙╟╣╣╜╙  ╫╣╣  ╟╣╣
 ╬╬╬╬┐     ╙╬╬╣╣      ╫╣╣╣╬      ╟╣╣╬    ╟╣╣╣ ╟╣╣╬   ╣╣╣  ╣╣╣  ╟╣╣     ╣╣╣┌╣╣╜
 ╬╬╬╜       ╬╬╣╣      ╙╝╣╣╬      ╙╣╣╣╗╖╓╗╣╣╣╜ ╟╣╣╬   ╣╣╣  ╣╣╣  ╟╣╣╦╓    ╣╣╣╣╣
 ╙   ╓╦╖    ╬╬╣╣   ╓╗╗╖            ╙╝╣╣╣╣╝╜   ╘╝╝╜   ╝╝╝  ╝╝╝   ╙╣╣╣    ╟╣╣╣
   ╩╬╬╬╬╬╬╦╦╬╬╣╣╗╣╣╣╣╣╣╣╝                                             ╫╣╣╣╣
      ╙╬╬╬╬╬╬╬╣╣╣╣╣╣╝╜
          ╙╬╬╬╣╣╣╜
             ╙
```

Now we can use ml-agents with Unity on a Mac M1/M2

## Things tried that didn't work

A lot of posts or github issues that you've likely filtered through always say what did work for them, but never what they tried and didn't work first. This leads you to try them (like I did) until you come to the same conclusion.

1. Set up x86 homebrew through rosetta to set up pyenv, this got me nowhere but headaches with aliases to keep both arm64 brew installed
2. Setting up pyenv with miniconda, also another drama as the number of Python executables in the path was causing nightmares.
3. Setting up miniconda on x86 to get access to older versions of Python
