#include <ansi.h>
#include <combat.h>

#define LIU "「" HIR "流水无情" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg, wn;
        object weapon;
        int ap, dp;
  
        me = this_player();

        if (userp(me) && ! me->query("can_perform/jueqing-jian/liu"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LIU "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" LIU "。\n");

        if ((int)me->query_skill("jueqing-jian", 1) < 60)
                return notify_fail("你绝情剑法不够娴熟，难以施展" LIU "。\n");

        if (me->query_skill_mapped("sword") != "jueqing-jian")
                return notify_fail("你没有激发绝情剑法，难以施展" LIU "。\n");

        if ((int)me->query_skill("force") < 80 )
                return notify_fail("你的内功火候不够，难以施展" LIU "。\n");
        
        if ((int)me->query("neili") < 60)
                return notify_fail("你现在的真气不够，难以施展" LIU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();

        msg = HIY "\n$N" HIY "长叹一声，一股悲切之情涌上心头，手中" + wn +
              HIY "迅猛无比地刺出，风声嗖嗖，完全不理会$n" HIY "的攻势，"
              "将自己的生死置之度外，这正是绝情谷绝学「" HIR "流水无情" HIY
              "」。" NOR; 

        message_sort(msg, me, target);
        
        ap = me->query_skill("jueqing-jian", 1);
        dp = target->query_skill("parry", 1);

        if (ap / 2 + random(ap) > dp)
        {
         	damage = ap + random(ap / 4);

         	msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 24,
                                          HIR "$n" HIR "见$N" HIR "此招剑势迅"
                                          "猛，似与自己共存亡，心中一惊，早已中"
                                          "剑。\n" NOR);

         	me->start_busy(1+random(2));
         	me->add("neili", -60);
        } else
        {
         	msg = CYN "然而$n" CYN "眼见" + wn + CYN "已至，但$n"
                      CYN "身法迅速无比，提气向后一纵，$N" CYN "扑了"
                      "个空。\n" NOR;

         	me->start_busy(2);
         	me->add("neili", -30);
        }
        message_combatd(msg, me, target);

        return 1;
}



