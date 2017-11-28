#include <ansi.h>
#include <combat.h>

#include "/kungfu/skill/eff_msg.h";

inherit F_SSERVER;

#define PO "「" HIC "乘风破浪" NOR "」"

int perform(object me)
{
        object *obs;
        string msg;
        int damage;
        int ap, dp;
        int flag;
        int i;
        int p;

        if (userp(me) && ! me->query("can_perform/taixuan-gong/po"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        me->clean_up_enemy();

        if (! me->is_fighting())
                return notify_fail(PO "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(PO "只能空手施展。\n");
                
        if (me->query("max_neili") < 8500)
                return notify_fail("你的内力的修为不够，现在无法使用" PO "。\n");

        if (me->query_skill("taixuan-gong", 1) < 260)
                return notify_fail("你的太玄功还不够娴熟，难以施展" PO "。\n");

        if (me->query_skill_mapped("force") != "taixuan-gong")
                return notify_fail("你现在没有激发太玄功为内功，难以施展" PO "。\n");

        if (me->query_skill_prepared("unarmed") != "taixuan-gong")
                return notify_fail("你现在没有准备使用太玄功，难以施展" PO "。\n");

        obs = me->query_enemy();

        if ((int)me->query("neili") < sizeof(obs) * 220)
                return notify_fail("你的真气不够，无法运用" PO "。\n");

        msg = HIW "只见$N" HIW"仰望天际，心中思绪万千。忽然间，$N" HIW "一声长叹，"
              "随即双掌不停地拍出，侠客岛石壁上的太玄图谱已一幅幅涌上心头，"
              "霎那间四周狂风骤起，尘土飞扬，气势如虹。这正是太玄功绝招「" 
              NOR + HIC "乘风破浪" NOR + HIW "」。转眼间，$N" HIW "双掌越发"
              "凌厉，已不知不觉地将四周笼罩，当真令人胆战心惊。\n" NOR;

        message_sort(msg, me);

        me->start_busy(5);

        ap = me->query_skill("force", 1) +
             me->query_skill("unarmed", 1) +
             me->query_skill("martial-cognize", 1) +
             me->query_skill("taixuan-gong", 1) +
             me->query("con") * 10;
  
        me->add("neili", -(sizeof(obs) * 220));

        for (flag = 0, i = 0; i < sizeof(obs); i++)
        {
                dp = obs[i]->query_skill("force") * 2 +
                     obs[i]->query_skill("martial-cognize", 1) +
                     obs[i]->query("con") * 10;

                if (ap * 2 / 3 + random(ap) > dp)
                {
                        switch (random(2))
                        {
                        case 0:
                                tell_object(obs[i], HIR "你只觉眼前风沙飞扬，周围风声萧萧，"
                                                    "一股内劲已经穿体而过。\n" NOR);
                                break;

                        default:
                                tell_object(obs[i], HIR "你只觉眼前风沙飞扬，周围风沙狂舞，"
                                                    "猛然间只觉千万股内劲已穿体而过。\n" NOR);
                                break;
                        }

                        damage = ap / 3 + random(ap / 2);

                        obs[i]->receive_damage("qi", damage, me);
                        obs[i]->receive_wound("qi", damage * 2 / 3 , me);

                        obs[i]->receive_damage("jing", damage / 4, me);
                        obs[i]->receive_wound("jing", damage / 6, me);

	                p = (int)obs[i]->query("qi") * 100 / (int)obs[i]->query("max_qi");

                        switch (random(5))
                        {
                        case 0:
                                msg = HIR "只听" + obs[i]->name() +
                                      HIR "一声惨嚎，接连退了数步，“"
                                      "哇”的呕出一大口鲜血。\n" NOR;
			        msg += "( " + obs[i]->name() + eff_status_msg(p) + " )\n\n";
                                break;

                        case 1:
                                msg = HIR "只见" + obs[i]->name() +
                                      HIR "向后飞出丈远，重重的跌落在"
                                      "地上，衣衫破烂，再也无法站起来"
                                      "。\n" NOR;
			        msg += "( " + obs[i]->name() + eff_status_msg(p) + " )\n\n";
                                break;

                        case 2:
                                msg = HIR "只见" + obs[i]->name() +
                                      HIR "歪歪斜斜倒退几步，伏倒"
                                      "在地，痛苦不堪。"
                                      "。\n" NOR;
			        msg += "( " + obs[i]->name() + eff_status_msg(p) + " )\n\n";
                                break;

                        case 3:
                                msg = HIR "狂风卷过，" + obs[i]->name() +
                                      HIR "只见，飞沙狂舞，却动也动不了"
                                      "忽然间，却瘫软在地。\n" NOR;
			        msg += "( " + obs[i]->name() + eff_status_msg(p) + " )\n\n";
                                break;

                        default:
                                msg = HIR + obs[i]->name() +
                                      HIR "急忙飞身而起，却猛然坠地，伤痕遍体，鲜"
                                      "血不止。\n" NOR;
			        msg += "( " + obs[i]->name() + eff_status_msg(p) + " )\n\n";
                                break;
                        }
                        obs[i]->start_busy(1);
                        message("vision", msg, environment(me), ({ obs[i] }));
                        obs[i]->add("neili", -500);
                        flag = 1;
                } else
                {
                        tell_object(obs[i], HIY "你只觉风沙狂起，顿时运力抵抗，方才挡"
                                    "住这招。\n" NOR);
                }
                if (obs[i]->query("neili") < 0)
                        obs[i]->set("neili", 0);
        }

        if (! flag) 
                message_vision(HIY "风沙骤停，却没有任何人受伤。\n\n" NOR, me, 0, obs);

        return 1;
}
