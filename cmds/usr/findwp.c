// findwp 寻找自制

#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

int main(object me, string str)
{
    object ob, owner;
    string msg, *ks;
    mapping summon;
    int i;

    if (!str)
    {
        summon = me->query("can_summon");
        if (!mapp(summon) || !sizeof(summon))
            return notify_fail("你要寻找什么物品？\n");

        ks = keys(summon);
        msg = "你现在可以寻找的物品有：\n";

        for (i = 0; i < sizeof(ks); i++)
        {
            if (!get_object(summon[ks[i]]))
                continue;
            msg += sprintf(HIW "物品ID：" MAG "%-15s" NOR HIW "    物品名字：%-20s\n" NOR, ks[i], summon[ks[i]]->name());
        }
        write(msg);
        return 1;
    }

    if (!stringp(str = me->query("can_summon/" + str)))
        return notify_fail("你不知道如何寻找这个物品。\n");

    if (me->is_ghost())
        return notify_fail("等你还了阳再召唤吧。\n");

    ob = find_object(str);
    if (!ob)
        ob = load_object(str);

    owner = environment(ob);
    if (owner == me)
    {
        tell_object(me, "眼瞎啊，不就在你自己身上吗！\n");
    }
    else if (!owner)
        tell_object(me, "这个人好像消失了！\n");
    else
        tell_object(me, "你的" + ob->query("name") + "在" + owner->query("name") + "那里，你去找他吧。\n");

    return 1;
}

int help(object me)
{
    write(@HELP
指令格式 : findwp <物品的ID>

此指令可让你寻找自己的自制物品。
HELP
    );
    return 1;
}
