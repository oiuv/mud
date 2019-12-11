#include <ansi.h>
#include <combat.h>

#define WSWD "「" HIR "无"BLU"双"HIM"无"HIW"对" NOR "」"
#define WS "「" HIR "无"BLU"双" NOR "」"
#define WD "「" HIM"无"HIW"对" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
    object weapon;
    string msg;
    int ap, dp;
    int damage, busy;

    if( !target ) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/kuihua-mogong/ws"))
        return notify_fail("你所使用的外功中没有这种功能。\n");

    if( !target || !me->is_fighting(target) || !living(target) )
        return notify_fail("无双无对只能对战斗中的对手使用。\n");

    if( ! objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "sword"
        || me->query_skill_mapped("sword") != "kuihua-mogong" )
            return  notify_fail("你现在无法使用绝技。\n");

    if (me->query_skill("kuihua-mogong", 1) < 400)
        return notify_fail("以你目前的修为来看，还不足以运用"WS"\n");

    if (me->query("max_neili") < 7000)
        return notify_fail("你的内力修为不够运用"WSWD"所需！\n");

    if (me->query("neili") < 1000)
        return notify_fail("你的内力不够运用"WS"所需！\n");

    if (! living(target))
        return notify_fail("对方都已经这样了，用不着这么费力吧？\n");
    ap = me->query_skill("kuihua-mogong", 1) + me->query("dex") * 20 + me->query_skill("martial-cognize", 1);
    dp = target->query_skill("parry",1) + target->query("dex") * 20 + target->query_skill("martial-cognize", 1);
    msg =HIM "$N突然身形一转眨眼间使出葵花魔功的终极绝招----"NOR""WSWD""HIM"之"NOR""WS"\n"HIW"$N眼神莹然有光，似乎进入了魔境之中。\n"
    "$N手中" + weapon->name() + "化做无双剑影攻向$n。\n";

        if (ap *3/5 + random(ap) < dp)
        {
            msg += HIG "然而$n" HIG "抵挡得法，将$N" HIG
            "的攻势化解。\n" NOR;
            busy = 2;
            me->add("neili", -300);
        } else
        {
            busy = 1;
            me->add("neili", -500);
            damage = ap + random(ap * 1 / 4) - random(100);
            msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 80,
              HIY "$n" BLU "只觉得已经跌入了万劫魔域之中，"HIY"$N手中"+weapon->name()+
              WHT "如同地狱中的鬼火般，从各个方位刺了过来，避无可避！\n" NOR);

        }
        message_vision(msg, me, target);
        if(me->query("can_perform/kuihua-mogong/wd")){
            call_out("perform2", 0, me, target, busy);
        }
        else{
            //没学会无对
            me->start_busy(busy);
            call_out("check_wd", 3, me);
        }

    return 1;
}
int perform2(object me, object target,int busy)
{       int ap, dp;
        string msg;
        int damage;

        if (!me || !target) return notify_fail("对手已经不在这里了！\n");
        if(!living(target))
            return notify_fail("对手已经不能再战斗了。\n");
        if(me->query("neili") < 1000)
            return notify_fail("你待要再出"WD"，却发现自己的内力不够了！\n");
        ap = me->query_skill("kuihua-mogong", 1) + me->query("dex") * 20 + me->query_skill("martial-cognize", 1);
        dp = target->query_skill("parry",1) + target->query("dex") * 20 + target->query_skill("martial-cognize", 1);

        msg =HIM "说时迟那时快，$N身形逆转使出了"NOR""WSWD"之"WD""HIM"式，刹那间天空阴云密布，\n"NOR""HIM"$n的心脏几乎停止了跳动，呆呆的望着$N\n"NOR;

        if (ap / 2 + random(ap) < dp)
        {
            msg += HIG "这时$n屏住呼吸" HIG "抵挡得法，将$N" HIG"的攻势一一化解。\n" NOR;
              busy += 2;
              me->add("neili", -300);
        } else
        {
            busy += 1;
            me->add("neili",-600);
            damage = ap + random(ap * 1 / 2) - random(100);
            msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 100,
              HIY "$n" BLU "只觉身上如同万剑穿心一般，"HIY"$N"
              WHT "如同死神一般，势必要取$n性命！\n" NOR);
        }
        me->start_busy(busy);
        message_vision(msg, me, target);
        return 1;
}
int check_wd(object me)
{
    if(me->query("int") + random(80) >= 100) {
        tell_object(me, HIW "\n你突然若有所悟，对刚才使用过的葵花魔功之"WS""HIW"式反复琢磨，\n对了，这样也可以耶！你学会了"WSWD""HIW"之"WD""HIW"式！\n" NOR);
        me->set("can_perform/kuihua-mogong/wd",1);
    }
    return 1;
}
