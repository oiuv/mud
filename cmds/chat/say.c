// chat command: say.c

#include <ansi.h>
#include <net/messaged.h>

inherit F_CLEAN_UP;

int main(object me, mapping info)
{
        object env;
        string msg;

        if (! objectp(env = environment(me)) || env == find_object(VOID_OB))
                return MESSAGE_D->error_msg("你现在在缥缈的虚空中，没"
                                            "有人听得到你说的话。\n");

        if (! stringp(msg = info[MESSAGE]))
                return MESSAGE_D->error_msg("你要说什么话？\n");

        message_vision(CYN "$N" CYN "说道：" + msg + "\n" NOR, me);
        return 1;
}

