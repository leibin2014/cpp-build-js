#ifndef MB4001BOOT_H
#define MB4001BOOT_H

#include "MhSerialFlash.h"
#include "MhConfiguration.h"
#include "InternalFlash.h"



class STM32L486Boot
{
public:

    STM32L486Boot();

    bool checkEnterFlash(void);
    void jump2Application(void);
    void reboot(void);

    void process(void);
    void updateCoreMCUfirmware(void);

    static const uint32_t   internFlashBufferSize  = 2048;
    static const uint32_t   serialFlashCoreMCUAddress  = 0x8000;

protected:
    void resetHardwareResource();

    MhConfiguration    imageFOTAConfig;
    InternalFlash      internFlash;

    uint8_t            flashBuffer[internFlashBufferSize];
};

#endif // MB4001BOOT_H

