HHH-YGD-02 - RF17 mini remote
===

[[manual](HHH-YGD-02%20manual.png)]

This is a remote for aquarium led light ramp.

The remote transmit a RF signal on the 433mhz band, the LED on the top-side is a red LED (not infrared)

It uses a simple protocol:
- PWM with a fixed period
- 25 bits transmissions
- 8 ones, 8 zeros, key code (1 byte), 1 one
exemple: 11111111 00000000 11101010 1
- no feedback from the ligh ramp
- **no identification of the remote**

The remote as 8 color button (R, G, B, W, 8am, 12am, 16pm, 20pm).

The light ramp remembers the program last set (6h ,9h, 12h, 16h (default)).
The program start from the moment the button is pressed. For exemple, if the 9h program 
button is pressed at 6h12, the light will be on for 9h with gradualy changing colors (8am, 12am, 16pm, 20pm). It will turn of at 15h12 and turn on again the next day at 6h12.

In case of a power outage ...

Pressing the on/off button or a color button has ... effect on the current program.

![remote image](HHH-YGD-02.avif)