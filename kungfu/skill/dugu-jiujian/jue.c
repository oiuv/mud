#include <ansi.h>

#define JUE "「" HIC "总诀式" NOR "」"

inherit F_SSERVER;

int perform(object me)
{
        string msg;
        object weapon;
        int skill, jing_cost;
        int improve;

        skill = me->query_skill("dugu-jiujian", 1);

        if (skill < 60)
                return notify_fail("你所使用的外功中没有这种功能。\n");

        jing_cost = 80 - (int)me->query("int");
        if (jing_cost < 30) jing_cost = 30;

        if (environment(me)->query("no_fight") && me->query("doing") != "scheme")
                return notify_fail("你周围过于嘈杂，难以演练" JUE "。\n");

        if (me->is_fighting())
                return notify_fail(JUE "不能在战斗中演练。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以演练" JUE "。\n");

        if (! skill || skill < 60)
                return notify_fail("你的独孤九剑等级不够，难以演练" JUE "。\n");

        if (me->query_skill("sword", 1) < skill)
                return notify_fail("你的基本剑法等级有限，难以演练" JUE "。\n");

        if (me->query("neili") < 85)
                return notify_fail("你现在真气不足，难以演练" JUE "。\n");

        if (me->query("jing") < -jing_cost)
                return notify_fail("你现在精神不佳，难以演练" JUE "。\n");

        if (! me->can_improve_skill("dugu-jiujian"))
                return notify_fail("你实战经验不足，难以演练" JUE "。\n");

        msg = HIC "$N" HIC "使出独孤九剑之「" HIW "总诀式"
              HIC "」，将手中" + weapon->name() + HIC "随"
              "意挥舞击刺。\n" NOR;
        message_combatd(msg, me);

        me->add("neili", -50 - random(30));
        me->receive_damage("jing", jing_cost);

        improve = 10 + random(me->query("int")) / 2;

        tell_object(me, HIY "你对「基本剑法」和「独孤九剑」"
                        "有了新的领悟。\n" NOR);
        me->improve_skill("sword", improve);
        me->improve_skill("dugu-jiujian", improve);
        me->start_busy(random(3));
        return 1;
}
