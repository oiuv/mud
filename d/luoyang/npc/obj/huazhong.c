#include <ansi.h>

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name(YEL "花种" NOR, ({"hua zhong", "hua", "zhong"}));
        set_weight(100);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一枚无法确定品种的花种。\n");
                set("unit", "只");
                set("value", 1);
                set("food_remaining", 1);
                set("food_supply", 10);
        }
}

void init()
{
        add_action("do_zhonghua", "zhonghua");
}

int do_zhonghua()
{
        object me, ob, where;
 
        me = this_player();
        ob = this_object();
        where = environment(me);

        if ((string)where->query("short") != "苗园")
                return notify_fail("这里似乎不适合种花吧？\n");

        if (me->query("combat_exp") < 5000)
        {
                tell_object(me, "你的经验尚浅，还是先到处多走动走动吧。\n");
                return 1;
        }

        if (me->query("combat_exp") > 30000)
        {
                tell_object(me, "以你的身份大概不适合种花了吧。\n");
                return 1;
        }

        if (me->query_temp("zhonghua") == 1)
        {
                tell_object(me, "种子已经播种了，现在该培育"
                                HIY "(peiyu)" NOR "花种了。"
                                "\n");
                return 1;
        }

        message_vision(HIC "$N" HIC "用手在地上挖了一个小"
                       "坑，把花种放了进去。\n" NOR, me);
        tell_object(me, "种子已经播种了，现在该培育" HIY
                        "(peiyu)" NOR "花种了。\n");
        me->add_temp("zhonghua", 1);
        destruct(ob);
        me->add("jing", -50);
        return 1;
}
