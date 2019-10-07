Title: Episode 11 - Power Quality Explained
Date: 2019-02-01 06:30
Author: admin
Category: Uncategorized
Tags: Code Fridays
Slug: episode-11-power-quality-explained
Status: published

<!-- wp:paragraph -->

I've always lived by the rule that if you can't explain something to a 5 year old then you don't know it well enough. I was asked recently by some (non-electrical focused) colleagues on a handful of electrical terms and components. One of the biggest things that kept popping up that I found difficult to explain clearly was power quality and it's issues. So I decided why not dedicate a blog post about it and write a basic example power factor capacitor calculator in Python.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Power quality is defined as "the concept of powering and grounding sensitive electronic equipment in a manner suitable for the equipment with precise wiring system and other connected equipment" by the IEEE (The Institute of Electrical and Electronics Engineers). In a simplistic view this is just trying to say that electrical equipment is to be installed/configured in a way that is operates as intended.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Quality of power is not determined by the one who produces it, it's defined by the end user of the power. Eg, like a physical product, if you buy something from a store and it's poor quality, that's being defined by the end user. Similar to that of a physical product, quality of power can be lost in a variety of forms/ways.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Issues with power quality can be categorized into three main categories:

<!-- /wp:paragraph -->

<!-- wp:list -->

-   Harmonic voltages and currents
-   Poor power factor
-   Voltage instability

<!-- /wp:list -->

<!-- wp:heading -->

Harmonics
---------

<!-- /wp:heading -->

<!-- wp:paragraph -->

AC (Alternating Current) electricity is generated as a sinusoidal waveform, and harmonics are signals/waves whose frequency is a whole number multiple of the frequency of the reference signal/wave. To visualize this phenomenon, we can use packages like NumPy and Matplotlib, to calculate and plot our base signal and it's harmonics (I encourage you to run this code and change the harmonics to see what they look like).

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"python"} -->

``` {.wp-block-syntaxhighlighter-code}
import numpy as np
import matplotlib.pyplot as plt

def Harmonic(i):
    x=np.linspace(0,2*np.pi,2000)
    y = [0 for _ in x] 
    for n in range(0,i):
        y += np.sin((2*n+1)*(2*np.pi)*(x))/(2*n+1)
    plt.plot(x,y)
    plt.grid()
    

Harmonic(1)
Harmonic(2)
# Harmonic(3)
# Harmonic(4)
# Harmonic(5)
plt.show()
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

The example above shows us the base signal (fundamental frequency), and it's first harmonic (harmonic of 2 or twice as fast as the fundamental frequency).

<!-- /wp:paragraph -->

<!-- wp:image {"id":129,"align":"center"} -->

::: {.wp-block-image}
![](https://i0.wp.com/jmckew.com/wp-content/uploads/2019/01/Harmonic1_2.png?fit=640%2C303&ssl=1){.wp-image-129}
:::

<!-- /wp:image -->

<!-- wp:paragraph -->

When these two signals are superimposed on each other, they produce a distorted waveform. Electrical equipment is designed to operate at the base signal (50Hz here in Australia), and typically does not cope with distorted wave like seen below when we superimpose a base signal with it's first harmonic.

<!-- /wp:paragraph -->

<!-- wp:image {"id":130,"align":"center"} -->

::: {.wp-block-image}
![](https://i2.wp.com/jmckew.com/wp-content/uploads/2019/01/Harmonic1_2_Combined.png?fit=640%2C303&ssl=1){.wp-image-130}
:::

<!-- /wp:image -->

<!-- wp:paragraph -->

Luckily, these issues are now easily detected and rectified by harmonic analyzers and active/passive harmonic filters.

<!-- /wp:paragraph -->

<!-- wp:heading -->

Power Factor
------------

<!-- /wp:heading -->

<!-- wp:paragraph -->

Power factor is a measure of how effectively power is being used in an electrical system, and is defined as the ratio of real (useful) to apparent (total) power.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Real power (kW) is the power that actually powers the equipment to produce useful work (such as spinning a motor). It can also be called actual, active or working power.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Reactive power (kVAR) is the power required by (some) equipment (eg, motors), to produce a magnetic field to enable the useful work to be produce. It's necessary to operate the equipment, however you don't see any result from the reactive power.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Apparent power (kVA) is the vector sum of the real power (kW) and reactive power (kVAR) and is the total power supplied from the mains power required to produce the right amount of real power.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Suppose you are running a store, you have to spend an amount of money X (cost) on buying products to sell in the future for a larger amount of money Y, meaning your profit will be P = Y - X. X is not lost money, without spending X you will not be able to make any profit P. The profit P is comparable to the active power, the earnings Y are the equivalent of apparent power and the initial cost X is the reactive power.

<!-- /wp:paragraph -->

<!-- wp:image {"id":145,"align":"center"} -->

::: {.wp-block-image}
![](https://jmckew.com/wp-content/uploads/2019/02/CodeCogsEqn.gif){.wp-image-145}
:::

<!-- /wp:image -->

<!-- wp:paragraph -->

Therefore, for a given power supply (kVA):\

<!-- /wp:paragraph -->

<!-- wp:list -->

-   The more cost you have (higher percentage of kVAR), the lower the ratio of kW (profit) to kVA (profit + cost), meaning a poorer power factor.
-   The less cost you have (lower percentage of kVAR), the higher your ratio of kW (profit) to kVA (profit + cost) becomes, and the better you power factor. As your cost (kVAR) approaches zero, your power factor approaches 1 (unity).

<!-- /wp:list -->

<!-- wp:heading -->

Voltage Instability
-------------------

<!-- /wp:heading -->

<!-- wp:paragraph -->

A stable voltage is when every piece of equipment connected to a network is operating under normal condition without issues, however when a fault or disturbance (harmonics) occurs in this system, the voltage becomes unstable.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Due to voltage instability, the electrical system's voltage may collapse, if the voltage is below acceptable limits. Voltage collapse may be a total or partial black, the terms voltage instability and voltage collapse are interchangeable.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

For example, if 10 generators are running to keep 10 machines working. Suddenly 3 of the generators run out of fuel, but the 10 machines keep going. This would cause a loss of generation, not being able to maintain the power required to keep all the machines working and consequentially since there is not enough power to share between any of the machines, all 10 machines will turn off, causing a total blackout.

<!-- /wp:paragraph -->

<!-- wp:heading -->

Capacitor Calculator - Python
-----------------------------

<!-- /wp:heading -->

<!-- wp:paragraph -->

Correcting power factor from a lagging (\<1) power factor, can be as simple as reducing reactive power (kVAR) in the system such that the ratio of real power (kW) to apparent power (kVA) is still as close to unity (1) as possible.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Since motors require inductive or lagging power for magnetizing before useful work beings, this brings makes the power factor of the system lagging (\<1). Capacitors provide capacitive or leading reactive power that cancels out the lagging power when used for power-factor improvement. The improved power factor changes the current requirements of the system, but not the one required by the motor.

<!-- /wp:paragraph -->

<!-- wp:image {"id":136,"align":"center"} -->

::: {.wp-block-image}
![Power factor calculation](https://jmckew.com/wp-content/uploads/2019/01/CodeCogsEqn-1-1.gif){.wp-image-136}
:::

<!-- /wp:image -->

<!-- wp:image {"id":137,"align":"center"} -->

::: {.wp-block-image}
![Apparent power calculation](https://jmckew.com/wp-content/uploads/2019/01/CodeCogsEqn-2.gif){.wp-image-137}
:::

<!-- /wp:image -->

<!-- wp:image {"id":138,"align":"center"} -->

::: {.wp-block-image}
![Reactive power calculation](https://jmckew.com/wp-content/uploads/2019/01/CodeCogsEqn-3.gif){.wp-image-138}
:::

<!-- /wp:image -->

<!-- wp:paragraph -->

Using these formulas we can calculate just how big of a capacitor we require:

<!-- /wp:paragraph -->

<!-- wp:image {"id":139,"align":"center"} -->

::: {.wp-block-image}
![](https://jmckew.com/wp-content/uploads/2019/01/CodeCogsEqn-4.gif){.wp-image-139}
:::

<!-- /wp:image -->

<!-- wp:image {"id":140,"align":"center"} -->

::: {.wp-block-image}
![](https://jmckew.com/wp-content/uploads/2019/01/CodeCogsEqn-5.gif){.wp-image-140}
:::

<!-- /wp:image -->

<!-- wp:image {"id":141,"align":"center"} -->

::: {.wp-block-image}
![](https://jmckew.com/wp-content/uploads/2019/01/CodeCogsEqn-6.gif){.wp-image-141}
:::

<!-- /wp:image -->

<!-- wp:image {"id":142,"align":"center"} -->

::: {.wp-block-image}
![](https://jmckew.com/wp-content/uploads/2019/01/CodeCogsEqn-7.gif){.wp-image-142}
:::

<!-- /wp:image -->

<!-- wp:paragraph -->

Once we input all these required formulas, and our initial data points, we are now able to easily compute the required size of capacitor to amend power factor issues.

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"python"} -->

``` {.wp-block-syntaxhighlighter-code}
from math import sqrt,pi

real_power = 2.2     #Real power in kW
current = 10         #Current in amps
voltage = 240        #Voltage in volts
frequency = 50       #Frequency in hertz
corrected_pf = 0.95  #Target power factor

#Calculate current power factor and apparent power
current_pf = 1000 * real_power / (voltage * current)
S_current = (voltage * current) / 1000

#Power factors greater than 1 will give imaginary Q_current, alert user
try:
    #Calculate current reactive power
    Q_current = sqrt(pow(abs(S_current),2) - pow(real_power,2))

    #Calculate target apparent power
    S_corrected = real_power / corrected_pf

    #Calculate required reactive power compensation
    Q_corrected = sqrt(pow(S_corrected,2) - pow(real_power,2))

    #Calculate size of capacitor required for reactive power
    Q_c = Q_current - Q_corrected
    C_f = 1000 * Q_c / (2*pi*frequency*voltage)

    #Print results to user
    print("Current power factor {0:.3f}".format(current_pf))
    print("Current apparent power {0:.3f} kVA".format(S_current))
    print("Current reactive power {0:.3f} kVAR".format(Q_current))
    print("Capacitor required {0:.3f} Farads".format(C_f))

except ValueError:
    print("Current power factor > 1")
```

<!-- /wp:syntaxhighlighter/code -->
