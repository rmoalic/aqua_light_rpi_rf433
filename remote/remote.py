import abc
import enum

class Rf_protocol(enum.Enum):
    PWM_FP = 0

class Remote(abc.ABC):

    @staticmethod
    @abc.abstractmethod
    def name() -> str:
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
    @abc.abstractmethod
    def rf_code(key) -> bytearray:
        pass
