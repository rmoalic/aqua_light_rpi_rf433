
import enum
from ..remote import Remote_pwm_fp, Rf_protocol

class Keys_HHH_YGD_02(enum.Enum):
    _UP   = 0xfb
    _OFF  = 0xfa
    _ON   = 0xf9
    _DOWN = 0xf8
    _R    = 0xf7
    _G    = 0xf6
    _8AM  = 0xf5
    _B    = 0xf4
    _W    = 0xf3
    _12AM = 0xf2
    _6H   = 0xf1
    _9H   = 0xf0
    _16PM = 0xef
    _ALL  = 0xee
    _12H  = 0xed
    _20PM = 0xec
    _FADE = 0xeb
    _16H  = 0xea


class Remote_HHH_YGD_02(Remote_pwm_fp):

    @staticmethod
    def name() -> str:
        return "HHH-YGD-02"
    
    @staticmethod
    def rf_code(key: Keys_HHH_YGD_02) -> bytearray:
        return bytearray([0xff, 0x00, key.value, 0x80])
    
    @staticmethod
    def rf_protocol_type():
        return Rf_protocol.PWM_FP

    @staticmethod
    def rf_timing_short() -> int:
        return 0.364
    
    @staticmethod
    def rf_timing_long() -> int:
        return 1.164
    
    @staticmethod
    def rf_timing_reset() -> int:
        return 1.284