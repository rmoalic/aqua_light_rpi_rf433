
import rpi_rf433_transmit
from remote.remote import Remote_pwm_fp
from remote.HHH_YGD_02 import Remote_HHH_YGD_02, Keys_HHH_YGD_02

import argparse
from functools import partial

def main():
    remote: Remote_pwm_fp = Remote_HHH_YGD_02()
    keys = Keys_HHH_YGD_02

    parser = argparse.ArgumentParser(prog="aqua_light",
                                     description="This program controls the aquarium lights")
    parser.add_argument("--key", choices=keys._member_names_, required=True)
    parser.add_argument("--tx_gpio_number", default=16, required=False, type=int)
    args = parser.parse_args()

    key = keys._member_map_.get(args.key)

    rf433 = rpi_rf433_transmit.RPI_rf433(tx_pin=args.tx_gpio_number)

    transmit = partial(rf433.transmit_pwm_fp, 
                       short_delay=remote.rf_timing_short(), 
                       long_delay=remote.rf_timing_long(), 
                       reset_delay=remote.rf_timing_reset())

    
    code, code_lenght = remote.rf_code(key)
    transmit(code, code_lenght)


if __name__ == "__main__":
    main()
