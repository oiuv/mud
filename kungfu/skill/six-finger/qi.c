// qi.c 无形剑气

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        int damage;
        string msg;
        int ap, dp;

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail("无形剑气只能对战斗中的对手使用。\n");

        if ((int)me->query_skill("force") < 360)
                return notify_fail("你的内功火候不够，使不出无形剑气。\n");

        if ((int)me->query_skill("six-finger", 1) < 180)
                return notify_fail("你的六荬神剑不够熟练，不会使用无形剑气。\n");

        if (me->query("max_neili") < 8000)
                return notify_fail("你的内力修为还不足以使出如此犀利的无形剑气。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你的真气不够，无法使用无形剑气。\n");

        if (me->query_skill_mapped("finger") != "six-finger")
                return notify_fail("你没有激发六脉神剑，无法使用无形剑气。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "中指一按，一股凌厉无伦的无形剑气直奔$n" HIC "胸前射去。\n" NOR;  

        ap = me->query_skill("finger");
        dp = target->query_skill("force");
        weapon = target->query_temp("weapon");
        me->start_busy(3);
        if (ap / 2 + random(ap) > dp)
        { 
                damage = ap + random(ap / 2);
                me->add("neili", -400);
                if (! objectp(weapon) || weapon->query("skill_type") == "pin")
                        msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 66,
                                                   HIR "$p" HIR "只觉得胸前一阵剧痛，鲜血"
                                                   "自创口激射而出，眼前顿时一黑！\n" NOR);
                else
                if (weapon->is_item_make() || weapon->query("damage") > 180 ||
                    weapon->query("skill_type") == "hammer")
                        msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 60,
                                                   HIR "$p" HIR "横" + weapon->name() + HIR "试图招架，"
                                                   HIR "怎奈这股剑气如此犀利，透过" + weapon->name() +
                                                   HIR "直震得$p" HIR "狂吐鲜血，五脏六腑都要翻转过来！\n" NOR);
                else
                {
                        msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 50,
                                                   HIR "$p" HIR "横转" + weapon->name() + HIR "，挡在胸"
                                                   "前，只听啪啦一声，" + weapon->name() +
                                                   HIR "碎成数截，激飞上天！\n$n" HIR "连退"
                                                   "几步，“哇”的吐了一口鲜血，脸色变的惨白。\n" NOR);
                        weapon->move(environment(me));
                        weapon->set("no_wield", weapon->name() + "已经碎掉了，没法装备了。\n");
                        weapon->set_name("碎掉的" + weapon->name());
                        weapon->set("value", 0);
                }
        } else
        {
                msg += CYN "可是$p" CYN "内功颇为深厚，轻轻将这道剑气化解于无形。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}

