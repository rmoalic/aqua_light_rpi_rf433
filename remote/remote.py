import abc
import enum
from typing import Tuple

class Rf_protocol(enum.Enum):
    PWM_FP = 0

class Remote(abc.ABC):

    @staticmethod
    @abc.abstractmethod
    def name() -> str:
        pass

    def fancy_name() -> str:
        pass

    @staticmethod
    @abc.abstractmethod
    def rf_protocol_type() -> Rf_protocol:
        pass

class Remote_pwm_fp(Remote):
    
    @staticmethod
    @abc.abstractmethod
    def rf_timing_short() -> int:
        pass
    
    @staticmethod
    @abc.abstractmethod
    def rf_timing_long() -> int:
        pass
    
    @staticmethod
    @abc.abstractmethod
    def rf_timing_reset() -> int:
        pass

    @staticmethod
    def rf_code(key) -> Tuple[bytearray, int]:
        pass
