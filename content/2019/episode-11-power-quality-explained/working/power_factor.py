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