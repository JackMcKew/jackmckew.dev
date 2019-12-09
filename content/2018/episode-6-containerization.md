Title: Episode 6 - Containerization
Date: 2018-12-28 08:30
Author: admin
Slug: episode-6-containerization
Status: published

Recently I was researching into ways to more efficiently and effectively distribute software and I stumbled across containerization of applications. Containerization of application is when an application is run on an OS-level virtualization without spinning up an entire virtual machine for the application.

Previously the way I had been distributing software I had been developing in my preferred language (Python) was by using PyInstaller (https://pyinstaller.readthedocs.io/en/stable/). However I was running into issues with distributing a single executable throughout users, although since the software was only used by a small userbase at this stage, I was able to continue to use PyInstaller. I started researching containerization as in the future the software I will be developing will be used by a larger userbase. This will hopefully be more effective at managing versions and distributing updates to said userbase.

Most other professionals in the software space have been constantly mentioning the use of Docker (https://www.docker.com/), I am now integrating my projects into Docker and have had no issues thus far.

By utilizing OS-level containerization this also allows the developer to run on any OS they wish. For multiple projects of mine, I had been intending to use influxDB (https://www.influxdata.com/), however was limited to a strictly Windows only network. I see Docker as a solution to this problem, by being able to create a linux based container to run an instance of an influxDB that can be spun up within a Windows environment and communicate back to the Windows users in the network.

Lastly, I'd like to wish a happy holidays to everyone reading and will be bringing more weekly content in the new year. Please do not hesitate to comment below if there is any topics/projects that you would like for me to research and write about my findings.
