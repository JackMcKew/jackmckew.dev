import numpy as np
import matplotlib.pyplot as plt

x=np.linspace(0,2*np.pi,2000)
y = [0 for _ in x]

def Harmonic(i):
    global y
    global x
    for n in range(0,i):
        y += np.sin((2*n+1)*(2*np.pi)*(x))/(2*n+1)

Harmonic(1)
Harmonic(2)
plt.plot(x,y)
plt.grid()
plt.show()