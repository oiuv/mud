// cut.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object ob;
        string part;
        string who;

        if (! arg)
                return notify_fail("你要割什么东西？\n");

        if (sscanf(arg, "%s from %s", part, who) != 2)
        {
                part = "?";
                who = arg;
        }

        if (! objectp(ob = present(who, environment(me))))
                return notify_fail("你附近没有这样东西。\n");

        if (ob == me)
                return notify_fail("割自己？你有毛病啊？\n");

        if (ob->query("can_speak"))
                return notify_fail("活人你也敢割，找打么。\n");

        if (ob->query("defeated_by") && ob->query("defeated_by") != me)
                return notify_fail("这具尸体已被别人盯上了，还是别动为妙。\n");

        notify_fail("你没有地方下手。\n");
        return ob->do_cut(me, part);
}

int help(object me)
{
        write( @HELP
指令格式: cut <something> from sth. | <sb>.

从某样东西上面割下一样东西。比如：
cut head from corpse
cut middle finger from arm

输入 cut ? from sth 你可以找到下手的部位。

HELP );
        return 1;
}
