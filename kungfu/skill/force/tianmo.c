// 天魔解体大法
//此buff下，不能yun heal，不能吃先天丹，无法中先天故事

#include <ansi.h>
#define TIANMO "「" RED "天魔解体大法" NOR "」"

inherit F_CLEAN_UP;

int exert(object me, object target)
{
    int shen, shen_lvl;
    int skill, count;
    int i;
    string *skills;

    shen = me->query("shen");
    shen_lvl = to_int(pow(to_float(-shen), 1.0 / 3));
    skill = me->query_skill("force", 1);
    count = (shen_lvl + skill) / 4;
    skills = keys(me->query_skill_map());

    if (me->query_temp("tianmo"))
        return notify_fail("你已经在运功中了。\n");

    if (me->query("str") < 30 && me->query("con") < 30)
        return notify_fail("你的资质不适合使用" TIANMO "。\n");

    if ((int)me->query("neili") < 8000)
        return notify_fail("你的内力不够!");

    if (me->query("shen") > -10000000)
        return notify_fail("你还没有入魔，无法使用" TIANMO "。\n");

    if ((int)me->query_skill("martial-cognize", 1) < 300 ||
        (int)me->query_skill("force", 1) < 300)
        return notify_fail("你的修行还不够,无法使用" TIANMO "。\n");

    me->set("neili", 0);
    me->receive_damage("qi", skill + shen_lvl + random(1000));
    me->receive_wound("qi", skill + shen_lvl + random(1000));
    me->receive_damage("jing", skill + shen_lvl + random(1000));
    me->receive_wound("jing", skill + shen_lvl + random(1000));

    message_combatd(RED "$N蓦地大叫一声，喷出一口鲜血，"
                        "正是天下闻名的 " TIANMO "。\n" NOR, me);

    me->add_temp("apply/str", me->query("str"));
    me->add_temp("apply/int", me->query("int"));
    me->add_temp("apply/con", me->query("con"));
    me->add_temp("apply/dex", me->query("dex"));
    //me->add_temp("apply/dodge", me->query("dex"));
    //me->add_temp("apply/parry", me->query("dex"));
    //me->add_temp("apply/force", me->query("con"));
    me->add_temp("apply/attack", count);
    me->add_temp("apply/damage", me->query("str") * 3);
    me->add_temp("apply/unarmed_damage", me->query("str") * 3);

    for (i = 0; i < sizeof(skills); i++)
    {
        me->add_temp("apply/" + skills[i], count / 2);
    }

    me->set_temp("tianmo", 1);

    if (me->is_fighting()) me->start_busy(3);

    return 1;
}
