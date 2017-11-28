#include <weapon.h>
#include <ansi.h>

inherit HAMMER;

#define ZHUJIAN    "/clone/lonely/book/zhujian1"

void create()
{
        set_name(NOR + YEL "黄金斧" NOR, ({"huangjin fu", "huangjin", "fu"}));
        set_weight(20000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", YEL "这是一柄纯金黄铸造的大斧，斧柄末端似乎有些松动。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "gold");
                set("wield_msg", YEL "$N" YEL "举起一柄纯黄所铸的大斧，随手挥舞了两下。\n" NOR);
                set("unwield_msg", YEL "$N" YEL "哈哈一笑，将手中的黄金斧收回背后。\n" NOR);
                set("stable", 100);
        }
        init_hammer(180);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;
        int my_exp, ob_exp;

        if (me->query_skill_mapped("hammer") != "leiting-fu"
           || me->query_skill("leiting-fu", 1) < 150)
                return damage_bonus / 2;

        switch (random(6))
        {
        case 0:
                n = me->query_skill("hammer");
                victim->receive_damage("qi", n, me);
                victim->receive_wound("qi", n, me);
                return YEL "$N" YEL "一声断喝，手中黄金斧霎时金芒暴涨，呼的一声朝$n"
                       YEL "猛劈而去！\n" NOR;
        }
        return damage_bonus;
}

void init()
{
        add_action("do_pick", "pick");
        add_action("do_pick", "turn");
}

int do_pick(string arg)
{
        object me, ob;
        me = this_player();

        if (! arg || ! id(arg))
                return 0;

        ob = find_object(ZHUJIAN);
        if (! ob) ob = load_object(ZHUJIAN);
        if (! environment(ob))
        {
                ob->move(me, 1);
                message_vision(HIC "$N" HIC "扭开斧柄，发现斧柄中空，其中藏"
                               "有一卷竹简。\n$N" HIC "顿时大喜过望，连忙将"
                               "之取出，收入怀中。\n" NOR, me);
                return 1;
        } else
	        return notify_fail(YEL "你扭开斧柄，发现柄中空空如也，什么"
                                   "都没有。\n" NOR);
}
