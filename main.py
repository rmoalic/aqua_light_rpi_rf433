
import rpi_rf433_transmit
from remote.remote import Remote_pwm_fp
from remote.HHH_YGD_02 import Remote_HHH_YGD_02, Keys_HHH_YGD_02

from functools import partial

def main():
    rf433 = rpi_rf433_transmit.RPI_rf433()
    remote: Remote_pwm_fp = Remote_HHH_YGD_02()
    keys = Keys_HHH_YGD_02

    transmit = partial(rf433.transmit_pwm_fp, 
                       short_delay=remote.rf_timing_short(), 
                       long_delay=remote.rf_timing_long(), 
                       reset_delay=remote.rf_timing_reset())

    
    code, code_lenght = remote.rf_code(keys._ON)
    transmit(code, code_lenght)


if __name__ == "__main__":
    main()