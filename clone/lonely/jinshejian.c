#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void create()
{
        set_name(YEL "金蛇剑" NOR, ({ "jinshe jian", "jinshe", "jian" }) );
        set_weight(10000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", HIY "只见那剑形状甚是奇特，整柄剑就如是一条蛇盘\n"
                                "曲而成，蛇尾勾成剑柄，蛇头则是剑尖，蛇舌伸\n"
                                "出分叉，是以剑尖竟有两叉。那剑金光灿烂，握\n"
                                "在手中甚是沉重，看来竟是黄金混和了其他五金\n"
                                "所铸，剑身上一道血痕，发出碧油油的暗光，极\n"
                                "是诡异。。\n" NOR);

                set("unit", "柄");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", HIY "破空而响，金蛇剑已出鞘，$N" HIY "全身凉飕飕地只感寒气逼人。\n" NOR); 
                set("unwield_msg", HIY "$N" HIY "手一扬，金蛇剑回鞘，四周寒气顿消。\n" NOR);
                set("stable", 100);
        }
        init_sword(100);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int ap, dp;
        int n;

        ap = me->query_skill("sword");
        dp = victim->query_skill("dodge");

        if (me->query_skill_mapped("sword") != "jinshe-jian" ||
            me->query_skill("jinshe-jian", 1) < 100 ||
            ap / 2 + random(ap) < dp)
                return damage_bonus / 2;

        switch (random(3))
        {
        case 0:
                if (! victim->is_busy())
                      victim->start_busy(me->query_skill("sword") / 10 + 4);
                return HIY "$N" HIY "怒喝一声，金蛇剑犹如灵蛇一般，蜿蜒游动，泛起淡淡金光，竟"
                       "将$n" HIY "笼罩在金光幻影之下。\n" NOR;

        case 1:
                n = me->query_skill("sword");
                victim->receive_damage("qi", n * 3 / 4, me);
                victim->receive_wound("qi", n * 3 / 4, me);
                return  HIY "$N" HIY "飞身而起，金蛇剑自天而下，犹如灵蛇般地舞动着卷向$n" HIY
                        "周身各处大穴！\n" NOR;

        }
        return damage_bonus;
}
