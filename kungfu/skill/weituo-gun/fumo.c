// fumo.c 韦陀伏魔

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
        int ap, dp;
        int damage;
  //if (userp(me) && ! me->query("can_perform/weituo-gun/fumo"))
  //              return notify_fail("你还没有受过高人指点，无法施展「韦陀伏魔」。\n");
 
	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
	        return notify_fail("「韦陀伏魔」只能在战斗中对对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "club")
		return notify_fail("你使用的武器不对。\n");

	if (me->query_skill("force") < 200)
		return notify_fail("你的内功的修为不够，难以使用这一绝技！\n");

	if (me->query_skill("weituo-gun", 1) < 140)
		return notify_fail("你的韦陀棍法修为不够，目前不能使用韦陀伏魔！\n");

	if (me->query("neili") < 800)
		return notify_fail("你的真气不够，不能使用韦陀伏魔！\n");

        if (me->query_skill_mapped("club") != "weituo-gun")
                return notify_fail("你没有激发韦陀棍法，不能使用韦陀伏魔！\n");

        if (me->query("shen") < 10000)
                return notify_fail("你正气不足，难以理解韦陀伏魔的精髓。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "脸色柔和，尽显一派慈祥之意，手中的" + weapon->name() +
              HIY "轻旋，恍惚中显出佛家韦陀神像，\n神光四射，笼罩住$n" + HIY "！\n" NOR;

        if (target->is_bad())
        {
                ap = me->query("shen") / 1000;
                if (ap > 100) ap = (ap - 100) / 4 + 100;
                if (ap > 200) ap = (ap - 200) / 4 + 200;
                if (ap > 300) ap = (ap - 300) / 4 + 300;
                if (ap > 400) ap = 400;
                msg += HIR "$n" HIR "平日作恶不少，见了此情此景，心中不禁颤然！\n" NOR;
        } else
                ap = 0;
        ap += me->query_skill("club"); 
        dp = target->query_skill("force");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                me->add("neili", -300);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 60,
                                           HIR "结果只听$p" HIR "一声惨叫，被$P"
                                           "一下子打中要害，七窍一起生烟，耳鼻都渗出血来！\n" NOR);

        } else
        {
                me->add("neili", -100);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "强摄心神，没有被$P"
                       CYN "所迷惑，硬生生的架住了$P" CYN "这一招！\n"NOR;
        }
	message_combatd(msg, me, target);

	return 1;
}
