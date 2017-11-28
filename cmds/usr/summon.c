// summon. 取回兵器

#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

int main(object me, string str)
{
    object ob;
    string msg, *ks;
    mapping summon;
    int i;

    if (! str)
    {
            summon = me->query("can_summon");
            if (! mapp(summon) || ! sizeof(summon))
                    return notify_fail("你要召唤什么物品？\n");

            ks = keys(summon);
            msg = "你现在可以召唤的物品有：\n";

            for( i=0; i<sizeof(ks); i++ )
            {
                    if( !get_object(summon[ks[i]]) ) continue;
                    msg += sprintf(HIW "物品ID：" MAG "%-15s" NOR HIW"    物品名字：%-20s\n"NOR,ks[i],summon[ks[i]]->name());
            }
            write(msg);
            return 1;
    }

    if (! stringp(str = me->query("can_summon/" + str)))
            return notify_fail("你不知道如何召唤这个物品。\n");

    if (me->is_ghost())
        return notify_fail("等你还了阳再召唤吧。\n");

    call_other(str, "???");
    ob = find_object(str);
    if (! ob || ! ob->receive_summon(me))
    {
            message_vision(HIM "$N" HIM "扬起手来，口中念念有"
                           "词。\n然而什么也没有发生 :)\n", me);
    }

    return 1;
}

int help(object me)
{
write(@HELP
指令格式 : summon <物品的ID>

此指令可让你把某些物品呼唤过来并装备上，当然你得有一定的
精力施展仙术才行。
HELP
    );
    return 1;
}
