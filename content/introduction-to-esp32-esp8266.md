Title: Introduction to ESP32/ESP8266
Date: 2019-03-22 06:30
Author: admin
Category: Code Fridays
Slug: introduction-to-esp32-esp8266
Status: published

<!-- wp:heading -->

What is an ESP32/ESP8266?
-------------------------

<!-- /wp:heading -->

<!-- wp:paragraph -->

The ESP32 and ESP8266 are low-cost Wi-Fi modules, which are perfect for DIY Internet of Things (IoT) projects. They both come with general purpose input/output pins (GPIOs), support a variety of protocols such as SPI, I2C, UART and many more. The most attractive part of the ESP range is that they come with wireless networking included, separating them from their Arduino microcontroller counterparts. All in all, the ESP series allows you to easily control/monitor devices remotely using Wi-Fi for a very low price.

<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->

### ESP32 vs ESP8266

<!-- /wp:heading -->

<!-- wp:paragraph -->

The ESP32 is the later ‘model’ of the ESP8266. It added a whole suite of new functionality such as: touch sensitive pins, built-in temperature and hall effect sensors and upgraded from single core CPU to a dual core, faster Wi-FI, more GPIOs and now supports Bluetooth and BLE (Bluetooth Low Energy). While both boards are very low-cost, the ESP32 costs slightly more, the ESP8266 (here in Australia) costs around \~\$10AU, and the ESP32 around \~\$22AU.

<!-- /wp:paragraph -->

<!-- wp:image {"align":"center"} -->

::: {.wp-block-image}
![\
**ESP8266**\
](https://lh5.googleusercontent.com/YEn9Lm0l_QN1jP9Ea6uZmsv35BVp1tqf5hzIZxX3FrVzfZ1MeN6k5pgU-gR6sWmydMCJr0s0pgN8yDBWOQ3-7FqAmAd2ic81lL-QyWsL_Vmu7DAObpqPS3KbeOCC6-ZVT_yV8F9x)
:::

<!-- /wp:image -->

<!-- wp:image {"align":"center"} -->

::: {.wp-block-image}
![\
**ESP32**\
](https://lh4.googleusercontent.com/yDWgNpn3xMkKX994_b1IzbLWxbo83S2DDKlgS9y4wVbp37ADfVuJwF2EX6H_UWEzcmHfxe_cuABMR920dr0Ebx5WNOwtj0mhoIZjPwiBQcEp0HI1_ZeB4RoL9xaDqCDd4h9651Cv)
:::

<!-- /wp:image -->

<!-- wp:heading -->

Flavours of ESP boards
----------------------

<!-- /wp:heading -->

<!-- wp:paragraph -->

There are currently many different varieties of ESP flavours you can buy off the shelf, while if you are more into developing the board around your ESP module (the pictures above) you can simply just purchase the relevant ESP module, or if you are like me and don’t want to bother soldering and developing your own board there is a solutions for you!\

<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->

### ESP32 Development Boards

<!-- /wp:heading -->

<!-- wp:heading {"level":4} -->

#### ESP32 Thing - Sparkfun

<!-- /wp:heading -->

<!-- wp:image {"align":"center"} -->

::: {.wp-block-image}
![](https://lh4.googleusercontent.com/KbaOiY3Ua8m_lSgC-RJu8arkN7Ao77SkRh8GBIqHYs13cJz4QD50ZNfJ7LzQh8OLUvmOvbwI1aABuY5airc2IlLBnV23U-I6PoX14HuFPBe4xHEEh8RR11TWp0ZTaINXCUoYJNC4)
:::

<!-- /wp:image -->

<!-- wp:paragraph -->

The ESP32 Thing comes with all the functionalities to easily communication and program the ESP32 with your computer (including a on-board USB-Serial). It also features a LiPo charger, so your ESP32 project can use rechargeable batteries without having to solder any terminals and make it easy to replace/disconnect the battery pack.

<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->

#### Espressif ESP32 Development Board - Developer Edition

<!-- /wp:heading -->

<!-- wp:image {"align":"center"} -->

::: {.wp-block-image}
![](https://lh4.googleusercontent.com/nEUzBIo2o0em3J1qshFFcl5j8nhsyrQ3u6hMco2gW590xiJhmjhOd7dRu8IUcCzu5yuKfOS43gEOaHSsNYRGIvLKSc1Yb3MjRL8vIZT5LNkTXud_DWZqL7paMXOPYx9eLzR2fPgX)
:::

<!-- /wp:image -->

<!-- wp:paragraph -->

If you’re not confident on soldering the header pins on the Sparkfun Thing board, then the Espressif board comes with that done for you! The header pins are also nicely spaced out so if you are a breadboard enthusiast, you can just plug and play on your breadboard and start connecting all your header wires.\
\

<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->

### ESP8266 Development Boards

<!-- /wp:heading -->

<!-- wp:heading {"level":4} -->

#### NodeMCU

<!-- /wp:heading -->

<!-- wp:image {"align":"center"} -->

::: {.wp-block-image}
![](https://lh4.googleusercontent.com/8uW0VTOhEuA6ILjpw2C2Mfv34emw8jjj9rIpuWjbedNzku76cVO6hBoScNNPpx1Ei0P4ci31B0gYeaO2hfvOER1v67J1PXAfkey9cFzvPWIU4qPL4Q3bb3vcnK5GBlIZu8hr2ujm)
:::

<!-- /wp:image -->

<!-- wp:paragraph -->

The NodeMCU is my personal favourite ESP flavour board because it is friendly to your breadboard, has an on-board USB-Serial and can be powered by USB. This all means that you can test and develop your board straight out of the box without fiddling around with soldering pins, voltages or getting any extra components (except a Micro-usb cable).

<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->

#### Adafruit Huzzah ESP8266 Breakout

<!-- /wp:heading -->

<!-- wp:image {"align":"center"} -->

::: {.wp-block-image}
![](https://lh6.googleusercontent.com/BN-_9XEuEPYw5wl_AiDR5OfcwF2ulK7SQMrpnmglXTe41m7ssb22kARsw8zyzmBJFeFQgHXG4jZQu1RN4Lj0itUJgeqqosQN7zZ4pzavsBPtguSzM819r2W7l-uBixDY4ZwRHDqq)
:::

<!-- /wp:image -->

<!-- wp:paragraph -->

The Huzzah board is Adafruits answer to other development boards that weren’t friendly to breadboards, didn’t have on-board voltage regulators and weren’t CE or FCC emitter certified. The Huzzah board comes with all these functionalities, although unlike the NodeMCU you will need to get a USB-Serial cable to able to program your Huzzah board.\

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

\

<!-- /wp:paragraph -->
