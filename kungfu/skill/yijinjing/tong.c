// shield.c 易筋经 易筋通脉

#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
        int skill;


        //if (me->query("family/family_name") != "少林派")
        //        return notify_fail("你不是少林弟子，无法使用“易筋通脉”。\n");
        if (userp(me) && ! me->query("can_perform/yijinjing/tong"))
                return notify_fail("你所学的内功中没有这种功能。\n");

        if (target != me)
                return notify_fail("你只能用易筋经来为自己易筋通脉。 \n");

        if ((skill = (int)me->query_skill("yijinjing", 1)) < 100)
                return notify_fail("你的易筋经等级不够。\n");

        if ((int)me->query("eff_qi")*100/(int)me->query("max_qi") > 80)
                return notify_fail("你伤势很轻，不用激励易筋经至高绝学。\n");

        if ((int)me->query("eff_qi")*100/(int)me->query("max_qi") < 10)
                return notify_fail("你内伤太重，无法激励易筋经至高绝学。\n");

        if ((int)me->query("neili") < skill*5 || (int)me->query("max_neili") < 500)
                return notify_fail("你的真气不够。\n");

        me->add("neili", -skill*4);
        me->receive_damage("qi", 0);

        message_combatd(HIM "$N" HIM "默念易筋经的口诀: "
                            "元气,气存于内,放于外。"
                            "易筋,孕怀于息,舒于支....\n"
                        HIW "一股详和的白色罡气自头顶迅速"
                        HIW "游遍" HIW "$N" HIW "的奇经八脉！\n"
                        HIC "$N" HIC "的内伤刹那间大为好转！！\n" NOR, me);

        me->add("max_neili", -skill/4);

        me->add("eff_qi",skill*8);
        if (me->query("eff_qi") > me->query("max_qi"))
                me->set("eff_qi",me->query("max_qi"));
        me->set("qi",me->query("eff_qi"));

        if (me->is_fighting()) me->start_busy(4);

        return 1;
}
