#include <ansi.h>
#include <combat.h>

#define SHI "「" NOR + WHT "腐尸毒" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
        object *corpse;
        int lvl, lvp, damage;
        int ap, dp;
        string name, msg;

        if (userp(me) && ! me->query("can_perform/chousui-zhang/shi"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(SHI "只能对战斗中的对手使用。\n");

        if (userp(me) && (me->query_temp("weapon")
           || me->query_temp("secondary_weapon")))
                return notify_fail(SHI "只能空手施展。\n");

        lvl = me->query_skill("chousui-zhang", 1);
        //lvp = me->query_skill("poison");
        lvp = me->query_skill("poison",1);

        if (lvl < 140)
                return notify_fail("你的抽髓掌不够娴熟，难以施展" SHI "。\n");

        if (lvp < 200)
                return notify_fail("你对毒技的了解不够，难以施展" SHI "。\n");

        if ((int)me->query_skill("throwing") < 180)
                return notify_fail("你暗器手法火候不够，难以施展" SHI "。\n");

        if (me->query_skill_mapped("strike") != "chousui-zhang")
                return notify_fail("你没有激发抽髓掌，难以施展" SHI "。\n");

        if (me->query_skill_prepared("strike") != "chousui-zhang")
                return notify_fail("你没有准备抽髓掌，难以施展" SHI "。\n");

        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力修为不足，难以施展" SHI "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在的内息不足，难以施展" SHI "。\n");

        corpse = filter_array(all_inventory(environment(me)),
                             (: base_name($1) == CORPSE_OB
                             && ($1->query("defeated_by") == this_player()
                             || ! $1->query("defeated_by")) :));

        //if (userp(me) && sizeof(corpse) < 1)
        if (userp(me) && sizeof(corpse) < 1 && lvl < 200)
                return notify_fail("你附近没有合适的尸体，难以施展" SHI "。\n");

        // 允许等级 250 以上的任务 NPC 施展此招
        //if (! userp(me) && lvl < 250 && sizeof(corpse) < 1)
                //return notify_fail("你附近没有合适的尸体，难以施展" SHI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        if (sizeof(corpse) >= 1)
                name = corpse[0]->name();
        else
                name = "路边的行人";

        msg = WHT "$N" WHT "随手抓起" + name + WHT "，将「"
              HIR "腐尸毒" NOR + WHT"」毒质运于其上，朝$n"
              WHT "猛掷而去。\n" NOR;

        ap = me->query_skill("strike") +
             //me->query_skill("poison");
             me->query_skill("poison",1);

        // 将任务NPC和玩家区分，再计算防御状况
        if (userp(me))
                dp = target->query_skill("dodge") +
                     target->query_skill("martial-cognize",1);
        else
                dp = target->query_skill("dodge") +
                     //target->query_skill("parry");
                     target->query_skill("parry",1);

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK, damage, 75,
                                          (: final, me, target, damage :));
                me->start_busy(3);
                me->add("neili", -300);
        } else
        {
                msg += CYN "可是$n" CYN "见势不妙，急忙腾挪身形，终"
                       "于避开了$N" CYN "掷来的尸体。\n" NOR;
                me->start_busy(4);
                me->add("neili", -200);
        }
        message_combatd(msg, me, target);

        if (sizeof(corpse) >= 1)
                destruct(corpse[0]);

        return 1;
}

string final(object me, object target, int damage)
{
        //int lvp = me->query_skill("poison") * 2 / 3;
        int lvp = me->query_skill("poison",1);

        target->affect_by("corpse_poison",
                ([ "level"    : lvp + random(lvp),
                   "id"       : me->query("id"),
                   "duration" : 5 + random(lvp / 20) ]));

        target->receive_damage("jing", damage / 4, me);
        target->receive_wound("jing", damage / 8, me);

        return  HIR "$n" HIR "只闻一股恶臭传来，大惊之下难以招"
                "架，顿被尸体击个正中。\n" NOR;
}
