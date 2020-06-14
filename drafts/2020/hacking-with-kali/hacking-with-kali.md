Title: Hacking with Kali Linux
Date: 2020-05-xx
Author: Jack McKew
Category: Software
Tags: software

## Network Hacking

### Checking Network Configuration

Commands to use in terminal to check network state:

- `ifconfig` for all connection states
- `iwconfig` for all **wireless** connection states

The MAC address (specified by manufacturer) will be listed in `ifconfig` under `ether`. You can alter the MAC address in memory directly by:

1. Disabling that adapter `ifconfig eth0 down`
2. Reassign a new MAC address `ifconfig eth0 hw ether 00:11:22:33:44:55`

> The MAC address will be reset upon restarting or reconnecting the device.

### Checking Wireless Networks

We can seek out wireless networks using `airodump-ng`. Ensure that your wireless access point (typically USB device) is in monitor mode with `iwconfig wlan0 mode monitor`. Now we can listen to available networks with `airodump-ng mon0` (where `mon0` is the access point in monitor mode). To listen on a variety of bands (eg, 2.4GHz and 5GHz), use the command `airodump-ng --band abg mon0`.

#### Sniffing Data from Specific Device

To sniff data to a file, the command `airodump-ng --bssid [MAC] --channel [network_channel] --write [file_name] [wireless card]`. This will sniff the data being transmitted by this device, and write it to a file. This data can later be analysed by programs like WireShark.

