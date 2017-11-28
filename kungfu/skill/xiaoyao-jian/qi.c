#include <ansi.h>
#include <combat.h>

#define LUO "「" HIW "奇剑诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg, wn;
        object weapon;
        int ap, dp;
  
        me = this_player();

        if (userp(me) && ! me->query("can_perform/xiaoyao-jian/qi"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LUO "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" LUO "。\n");

        if ((int)me->query_skill("xiaoyao-jian", 1) < 160)
                return notify_fail("你逍遥剑法不够娴熟，难以施展" LUO "。\n");

        if (me->query_skill_mapped("sword") != "xiaoyao-jian")
                return notify_fail("你没有激发逍遥剑法，难以施展" LUO "。\n");

        if ((int)me->query_skill("force", 1) < 160)
                return notify_fail("你的内功火候不够，难以施展" LUO "。\n");

        if (me->query("max_neili") < 2200)
                return notify_fail("你内力修为不足，难以施展" LUO "。\n");

        if ((int)me->query("neili") < 350)
                return notify_fail("你现在的真气不够，难以施展" LUO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();
                           
        msg = HIW "\n$N" HIW "将" + wn + HIW "斜指长空，猛地飞身跃起，"
              + wn + HIW "忽左忽右，飘忽不定，猛然间破空长响，" + wn + HIW
              "直指向$n" HIW "咽喉。这正是逍遥剑法之「" HIG "奇剑诀" HIW "」，"
              "当真是招招精奇，神妙无比。\n" NOR;

        message_sort(msg, me, target);

        ap = me->query_skill("sword") + me->query_skill("dodge");
        dp = target->query_skill("parry") + target->query_skill("dodge");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap / 4);

         	msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 78,
                                          HIR "$n" HIR "只见一道电光从半空袭来，"
                                          "心中惊骇不已，但鲜血已从$n胸口喷出。\n" 
                                          NOR);
         	//me->start_busy(2 + random(4));
         	me->start_busy(2);
         	me->add("neili", -300);
        } else
        {
         	msg = CYN "然而$n" CYN "眼明手快，侧身一跳"
                      "躲过$N" CYN "这一剑。\n" NOR;

         	//me->start_busy(2);
         	me->start_busy(2 + random(4));
         	me->add("neili", -200);
        }
        message_combatd(msg, me, target);

        return 1;
}



