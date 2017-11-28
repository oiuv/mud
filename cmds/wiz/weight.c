// weight.c
// created by doing

#include <ansi.h>

inherit F_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
        object env;
        int origin;
	string msg;
        string to;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

        switch (arg)
        {
        case "light":
                if (me->query_weight() < 2)
                        return notify_fail("你已经轻的不能再轻了。\n");
                me->set_weight(me->query_weight() / 2);
                to = "轻";
                break;

        case "heavy":
                if (me->query_weight() >= 128 * 1024)
                        return notify_fail("你无法变得更重了。\n");
                if (! me->query_weight())
                        me->set_weight(1);
                else
                        me->set_weight(me->query_weight() * 2);
                to = "重";
                break;

        case "origin":
                origin = 40000 + (me->query("str") - 10) * 2000;
                if (origin > me->query_weight())
                        to = "重"; else
                if (origin < me->query_weight())
                        to = "轻"; else
                        return notify_fail("你的体重没有任何变化。\n");

                me->set_weight(origin);
                break;

        default:
                help(me);
                return 1;
        }

        tell_object(me, HIM "哗！你觉得你变得" + to + "了一些。\n" NOR);

        if (objectp(env = environment(me)))
        {
                message("vision", me->name() + "口中念念有词，不知道"
                        "在干些什么。\n", env, ({ env, me }));

                if (userp(env) && !me->query("env/invisible"))
                        tell_object(env, HIM "你忽然觉得身上好像" +
                                         to + "了很多。\n" NOR);
        }

	return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : miagic <light | heavy | origin>
 
这个指令会使你的重量变化，每次加倍或是减半。如果指明 origin
就恢复原来的体重。
 
HELP );
    return 1;
}
