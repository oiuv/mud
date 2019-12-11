#include <ansi.h>
#include <combat.h>

#define XIN "「" HIR "摄心大法" NOR "」"

inherit F_SSERVER;

void remove_effs(object target);

string final(object me, object target, int damage);

int perform(object me, object target)
{
        string msg;
        int ap, dp;
        int times;

        me = this_player();

        if (userp(me) && ! me->query("can_perform/jiuyin-shengong/xin"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(XIN "只能在战斗中对对手使用。\n");

        if ((int)me->query_skill("jiuyin-shengong", 1) < 280)
                return notify_fail("你九阴神功不够娴熟，难以施展" XIN "。\n");

        if ((int)me->query_skill("force", 1) < 280)
                return notify_fail("你内功根基不够，难以施展" XIN "。\n");

        if (me->query_skill_mapped("force") != "jiuyin-shengong")
                return notify_fail("你没有激发九阴神功为内功，难以施展" XIN "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在的真气不够，难以施展" XIN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIM "\n$N" HIM "猛然间尖啸一声，施展出九阴神功中的「" HIR "摄心大法" HIM"」。"
              "只见$N" HIM "各种招式千奇百怪、变化多端，脸上喜怒哀乐，怪状百出。\n" NOR;

        ap = me->query_skill("jiuyin-shengong", 1) + me->query_skill("force", 1);
        dp = target->query_skill("martial-cognize", 1) + target->query_skill("force", 1);

        if (ap * 11 / 20 + random(ap) > dp)
        {
             msg += HIG "$n" HIG "登时觉得胸口苦闷之极，心神难以自制，喜怒哀乐竟全随着$N" HIG
                    "而变。顷刻之间，$n" HIG "顿觉精力不济，头晕目眩。\n" NOR;

             me->start_busy(2 + random(4));
             me->add("neili", -400);
             target->start_busy(2 + random(4));
             target->receive_damage("jing", ap / 2 + random(ap / 4) );
             target->receive_wound("jing", ap / 2 + random(ap / 8) );
             target->set_temp("eff/jiuyin-shengong/xin", 1);

             if (target->query_skill("martial-cognize", 1) < 200)times =  ap / 10 + random(6);
             if (target->query_skill("martial-cognize", 1) >= 200)times = ap / 11 + random(6);
             if (target->query_skill("martial-cognize", 1) >= 220)times = ap / 12 + random(6);
             if (target->query_skill("martial-cognize", 1) >= 260)times = ap / 14 + random(6);
             if (target->query_skill("martial-cognize", 1) >= 300)times = ap / 16 + random(6);
             if (target->query_skill("martial-cognize", 1) >= 340)times = ap / 18 + random(6);
             if (target->query_skill("martial-cognize", 1) >= 360)times = ap / 22 + random(6);
             if (target->query_skill("martial-cognize", 1) >= 380)times = ap / 30 + random(6);
             if (target->query_skill("martial-cognize", 1) > 400)times = 8 + random(7);
             remove_call_out("remove_effs");
             call_out("remove_effs", times, target);

        } else
        {
              msg += NOR + CYN "$n" NOR + CYN "怒喝道：“尔等妖法，休想迷惑我！”。猛然间，招式陡快，"
                     "竟将$N" NOR + CYN "这招破去。\n" NOR;
              me->add("neili", -200);
              me->start_busy(1 + random(2));
        }
        message_sort(msg, me, target);

        return 1;
}

void remove_effs(object target)
{
        if (! objectp(target) || ! target->query_temp("eff/jiuyin-shengong/xin"))return;
        target->delete_temp("eff/jiuyin-shengong/xin");
        tell_object(target, HIW "猛然间你气血上冲，头昏胀痛之感顿然消去，精力逐渐集中起来。\n" NOR);
        return;
}
