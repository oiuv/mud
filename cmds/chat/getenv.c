// chat command: getenv.c

#include <net/messaged.h>

inherit F_CLEAN_UP;

int main(object user, mapping info)
{
        seteuid(getuid());
        MESSAGE_D->send_env(info[USER]);
        return 1;
}

