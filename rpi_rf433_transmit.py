import time
try:
    import RPi.GPIO as GPIO
except RuntimeError as e:
    print("RPi.GPIO: RuntimeError {}".format(e))
    import gpio_mock as GPIO


def byte_to_bit(b) -> bool:
    tmp = b
    for _ in range(8):
        yield (tmp & 0x80) > 0
        tmp <<= 0x01

def sleep(delay_ms: int):
    time.sleep(delay_ms / 1000)


class RPI_rf433:
    INSTANCES = 0
    REPLAY = 3

    def __init__(self, tx_pin: int = 32):
        self.gpio_tx_pin = tx_pin
        self.INSTANCES = self.INSTANCES + 1
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.gpio_tx_pin, GPIO.OUT, initial=GPIO.LOW)
    
    def __del__(self):
        self.INSTANCES = self.INSTANCES - 1
        if self.INSTANCES == 0:
            GPIO.cleanup()

    def transmit_pwm_fp(self, code: bytearray, short_delay: int, long_delay: int, reset_delay: int):
        GPIO.setmode(GPIO.BCM)
        code_bits = []
        for byte in code:
            code_bits.extend(list(byte_to_bit(byte)))
        
        transmit_once_time = len(code_bits) * (short_delay + long_delay)
        transmit_time = transmit_once_time * self.REPLAY + (reset_delay * self.REPLAY)
        print(f"Transmitting {len(code_bits)}bits in {transmit_time}ms ({self.REPLAY} * {transmit_once_time}ms)")

        for _ in range(self.REPLAY):
            for bit in code_bits: # TODO: Skip last extra bits
                if bit:
                    GPIO.output(self.gpio_tx_pin, 1)
                    sleep(short_delay)
                    GPIO.output(self.gpio_tx_pin, 0)
                    sleep(long_delay)
                else:
                    GPIO.output(self.gpio_tx_pin, 1)
                    sleep(short_delay)
                    GPIO.output(self.gpio_tx_pin, 0)
                    sleep(long_delay)
            sleep(reset_delay)
