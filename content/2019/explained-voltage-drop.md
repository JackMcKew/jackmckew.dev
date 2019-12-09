Title: Explained: Voltage Drop
Date: 2019-05-10 06:30
Author: Jack McKew
Tags: electrical
Slug: explained-voltage-drop
Status: published

Voltage drop is a electrical phenomenon in that wires carrying current always have resistance, or impedance to the current flow. Voltage drop is defined as the amount of loss that occurs through part of or all of a circuit due to resistance/impedance.

The most well known analogy for explaining voltage, current and voltage drop is a hose carrying water. In the garden hose, the water pressure is the voltage, the amount of water flowing is the current and the type and size of the hose makes up the resistance. Thus meaning that voltage drop is the loss of water pressure from the supply end of the hose to the output.

When designing electrical systems within Australia and New Zealand, we are required to design to Australian standards. For voltage drop, the relevant standards as AS/NZS3000 (Wiring Rules) and AS/NZS3008 (Cable Selection). Where AS/NZS3000 nominates the limits to conform to (5% maximum from point of supply) and AS3008 dictates multiple ways that voltage drop can be calculated.

For this post, I will demonstrate a simplified method that is outlined in AS3000 Table C7 where it specifies 'Am per %Vd' (Amp meters per % voltage drop) for each cable size: 

| Cable Conductor Size | Single Phase (230V) Am per %Vd | Three Phase (400V) Am per %Vd |
| -------------------- | ------------------------------ | ----------------------------- |
| 1mm^2^               | 45                             | 90                            |
| 1.5mm^2^             | 70                             | 140                           |
| 2.5mm^2^             | 128                            | 256                           |
| 4mm^2^               | 205                            | 412                           |
| 6mm^2^               | 306                            | 615                           |
| 10mm^2^              | 515                            | 1034                          |
| 16mm^2^              | 818                            | 1643                          |
| 25mm^2^              | 1289                           | 2588                          |
| 35mm^2^              | 1773                           | 3560                          |
| 50mm^2^              | 2377                           | 4772                          |
| 70mm^2^              | 3342                           | 6712                          |
| 95mm^2^              | 4445                           | 8927                          |

For example, a 50m run of 10mm\^2^ cable carrying 3 phase 32A will result in 5% drop: 32A \* 50m = 1600 / 1034 = 1.5%.

In future posts, I will go into the various ways that AS/NZS3008 demonstrates ways of calculating voltage drop.
