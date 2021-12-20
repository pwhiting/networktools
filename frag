
mkdir -p /etc/hotplug.d/button
chmod 777 /mnt
cat > /mnt/parameters.txt << 'EOF'
This file can contain settings for mtu, reorder percentage, and delay.
It ignores everything that doesn't look like the lines below.
uncomment the lines below if you want to change the value
#reorder=50 (this is a percentage)
#mtu=300    (technically should be >= 576)
#delay=1   (in ms)
EOF
chmod 666 /mnt/parameters.txt


cat > /etc/hotplug.d/button/buttons << 'EOF'
reorder=50  # percent out of order 
mtu=300    # bytes 
delay=1   # ms
file=/mnt/parameters.txt

while read var; do
 eval $(echo $var | grep -oE "^\s*(reorder|mtu|delay)\s*=\s*[0-9]*")
done < "$file"

emulate() {
 tc qdisc del dev eth0.2 $dev root
 tc qdisc add dev eth0.2 $dev root handle 1: netem delay ${delay}ms reorder ${reorder}% 50% gap 2
 ifconfig eth0.2 mtu $mtu up
}

if [ ${BUTTON} == "BTN_0" ] ; then
 logger "the button was ${BUTTON} and the action was ${ACTION}"
 if [ ${ACTION} == "pressed" ] ; then
  emulate
 else
  tc qdisc del dev eth0.2 root   
  ifconfig eth0.2 mtu 1500 up
 fi
fi

EOF

