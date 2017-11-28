// input.c

#include <net/messaged.h>

inherit F_CLEAN_UP;

int main(object me, mapping info)
{
        seteuid(getuid());

        if (! me->is_input())
                // not in input mode, I will ignore it.
                return 1;

        me->receive_input(info[MESSAGE]);
        return 1;
}

