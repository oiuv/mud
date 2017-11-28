// finger

#include <ansi.h>
#include <net/messaged.h>

inherit F_CLEAN_UP;

int main(object me, mapping info)
{
        string msg;
        string fun;

        if (! stringp(info[ARG]))
                return MESSAGE_D->error_msg("请输入你要查询的用户代号。\n");

	msg = FINGER_D->finger_user(info[ARG], me);
        if (sscanf(info[ARG], "%*s@%*s") == 2)
        {
                // finger remote user ?
                fun = FUN_TELL; // Only message to user
                msg = HIY + msg + NOR;
        } else
        {
                fun = FUN_NOTICE;
                msg = HIW "关于用户(" + info[ARG] + ")的查询信息：\n"
                      NOR + msg;
        }

        MESSAGE_D->tell_user(me, fun, msg);
        return 1;
}

