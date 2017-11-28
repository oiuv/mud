#include <ansi.h>
#include <combat.h>

#define WAN "「" HIR "万剑焚云" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
        string msg, wn;
        object weapon;
        int ap, dp, damage;

        me = this_player();

        if (userp(me) && ! me->query("can_perform/zhurong-jian/wan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(WAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" WAN "。\n");

        if ((int)me->query_skill("zhurong-jian", 1) < 160)
                return notify_fail("你祝融剑法不够娴熟，难以施展" WAN "。\n");

        if (me->query_skill_mapped("sword") != "zhurong-jian")
                return notify_fail("你没有激发祝融剑法，难以施展" WAN "。\n");

        if ((int)me->query_skill("force") < 220)
                return notify_fail("你的内功火候不够，难以施展" WAN "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不够，难以施展" WAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();
                            
        msg = HIM "\n$N" HIM "剑招突变，将真气注入剑身，剑体顿时变得通红，一式「"
              HIR "万剑焚云" HIM "」使出，霎时呼啸声大作，手中" + wn + HIM "化做"
              "千万柄利刃，笼罩$n" HIM "周身。" NOR; 

        message_sort(msg, me, target);

        ap = me->query_skill("sword");
        dp = target->query_skill("dodge");

        if (random(ap) > dp / 2)
        {
         	damage = ap / 2 + random(ap);
         	damage += random(damage / 3);

                msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 55,
                                          (: final, me, target, damage :));
                me->start_busy(3);
         	me->add("neili", -200);
        } else
        {
         	msg = CYN "$n" CYN "眼剑" +wn + CYN"已至，强自镇定，"
                      "侧身躲过，但对$N" CYN "这招仍是心有余悸。\n" NOR;

       		me->start_busy(4);
         	me->add("neili", -100);
        }
        message_combatd(msg, me, target);

        return 1;
}

string final(object me, object target, int damage)
{
        int lvl, n;

        lvl = me->query_skill("zhurong-jian", 1);
        n = 1 + random(lvl / 20);

        target->affect_by("zhurong_jian",
                ([ "level"    : lvl + random(lvl),
                   "id"       : me->query("id"),
                   "duration" : lvl / 50 * n + random(lvl / 20) ]));

        return  HIR "只见$N" HIR "这一招疾如电、猛如火，$n"
                HIR "心中惊疑不定，电光火石间，\n已被$N" HIR
                "划中" + chinese_number(n) + "剑，剑伤处嗤"
                "嗤作响，鲜血从外衣渗出。\n" NOR;
}
