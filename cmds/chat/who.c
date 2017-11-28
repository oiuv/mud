// who

#include <ansi.h>
#include <command.h>
#include <net/messaged.h>

inherit F_CLEAN_UP;

int main(object me, mapping info)
{
        string msg;

        if (! stringp(info[ARG]))
                return MESSAGE_D->error_msg("请输入你要查询的用户代号。\n");

	msg = WHO_CMD->main(me, info[ARG], 1);
        MESSAGE_D->tell_user(me, FUN_VISION, msg);
        return 1;
}

