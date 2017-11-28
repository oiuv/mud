// head.c 脑袋

#include <ansi.h>

inherit ITEM;
inherit F_FOOD;
inherit F_CUTABLE;
inherit F_SILENTDEST;

void eat_effect();
int is_head() { return 1; }

void create()
{
        set_name(NOR + RED "头颅" NOR, ({ "head" }));
        set_weight(1500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "颗");
                set("value", 1);
                set("no_sell", "我的天…这…这你也拿来卖…官…官府呢？");
                set("food_supply", 10);
                set("food_remaining", 4);
                set("long", RED "这是一颗鲜血淋淋的首级，鲜血正缓缓渗出。\n" NOR);
        }
}

int set_from(object owner)
{
        apply_effect((: eat_effect :));
        set("owner_id",  owner->query("owner_id"));
        set("is_player", owner->query("is_player"));
        set("killed_by", owner->query("killed_by"));
        set("defeated_by", owner->query("defeated_by"));
        set("defeated_by_who", owner->query("defeated_by_who"));
        set("assist", owner->query("assist"));
        set("gender", owner->query("gender"));

        if (! stringp(owner->query("victim_name")))
        {
                set("name", "腐烂的人头");
                owner->set("name", "腐烂的无头尸体");
        } else
        {
                set("name", owner->query("victim_name") + "的人头");
                owner->set("name", "无头尸体");
        }

        if (owner->query_temp("clawed_by_jiuyin"))
        {
                set_temp("clawed_by_jiuyin", 1);
                set("long", query("long") +
                            "上面赫然有五个小洞，伸手一探，刚好可以插入。\n");
        }

        set_name(NOR + RED + query("name") + NOR, ({ "head" }));
        return 1;
}

int do_cut(object me, string part)
{
        if (! query("food_remaining"))
                return 0;

        return ::do_cut(me, part);
}

int finish_eat()
{
        set_name(NOR + WHT "骷髅头" NOR, ({ "bone" }));
        set_weight(150);
        set("long", WHT "这是一个白森森的骷髅头。\n" NOR);
        return 1;
}

void eat_effect()
{
        object me;

        me = this_player();
        me->add("combat/eatman", 1);
        if (me->query("shen") > -1000)
                me->set("shen", -1000);
}
