#include <ansi.h>
#include <combat.h>

#define JING "「" HIW "白首太玄经" NOR "」"

inherit F_SSERVER;

string final1(object me, object target, int damage, object weapon, int lvl);
string final2(object me, object target, int damage);
string final3(object me, object target, int damage, object weapon, int lvl, string msg);

int perform(object me, object target)
{
        int damage;
        string msg, sub_msg;
        int ap, dp;
        object weapon;
        int flag = 0;
        int lvl;

        if (userp(me) && ! me->query("can_perform/taixuan-gong/jing"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(JING "只能对战斗中的对手使用。\n");

        if ((! objectp(weapon = me->query_temp("weapon"))) ||
            ((string)weapon->query("skill_type") != "sword" 
            && (string)weapon->query("skill_type") != "blade"))
                return notify_fail("你使用的武器不对，难以施展" JING "。\n");

        if ((int)me->query_skill("force", 1) < 340)
                return notify_fail("你内功修为不够，难以施展" JING "。\n");

        if ((int)me->query("max_neili") < 10000)
                return notify_fail("你内力修为不够，难以施展" JING "。\n");

        lvl = (int)me->query_skill("taixuan-gong", 1);
        if (lvl < 340)
                return notify_fail("你太玄功火候不够，难以施展" JING "。\n");

        if (me->query_skill_mapped("sword") != "taixuan-gong"
            && me->query_skill_mapped("blade") != "taixuan-gong")
                return notify_fail("你没有激发太玄功为刀或剑，难以施展" JING "。\n");

        // 分别判断激发刀剑时需要的刀、剑等级。
        if (me->query_skill_mapped("sword") == "taixuan-gong")
        {               
                if (me->query_skill("sword", 1) < 340)
                        return notify_fail("你的基本剑法火候不足，难以施展" JING "。\n");

                else 
                {
                       flag = 1; // 设置激发为sword标志
                       sub_msg = "剑";
                }
        }
        else // 激发为刀
        {
                if (me->query_skill("blade", 1) < 340)
                        return notify_fail("你的基本刀法火候不足，难以施展" JING "。\n");
                else 
                {
                       flag = 0; // 设置激发为blade标志
                       sub_msg = "刀";
                }
        }

        if ((int)me->query("neili") < 850)
                return notify_fail("你现在真气不够，难以施展" JING "。\n");

        if (me->query_skill("martial-cognize", 1) < 260)
                return notify_fail("你武学修养不足，难以施展" JING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        message_sort(HIM "\n$N" HIM "情不自禁的纵声长啸，霎时之间，千百种招式纷至沓来，涌"
                     "向心头。$N" HIM "随手挥舞，已是不按次序，但觉无论何种招式皆能随心所欲"
                     "，既不必存想内息，亦不须记忆招数，石壁上的千百种招式，自然而然的从心"
                     "中传向手足，尽数袭向$n" HIM "。\n" NOR, me, target);


        if (flag)ap = lvl + me->query_skill("sword", 1);
        else ap = lvl + me->query_skill("blade", 1);

        // 第一招，判断对方臂力
        dp = target->query_str() * 2 + target->query_skill("unarmed", 1) + 
             target->query_skill("parry", 1);

        message_sort(HIW "\n$N" HIW "突然间只觉得右肋下‘渊液穴’上一动，一道热线沿着‘足少"
                     "阳胆经’，向着‘日月’、‘京门’二穴行去，一招‘十步杀一人’的" + sub_msg + 
                     "法已随意使出，各种招式源源而出，将$n" HIW "笼罩。\n" NOR, me, target);

        if (ap * 4 / 5 + random(ap) > dp)
        {
                damage = ap + random(ap);
                msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 80 + random(10),
                                         (: final1, me, target, damage, weapon, lvl :));
        } else
        {
                msg = HIC "$n" HIC "气贯双臂，凝神以对，竟将$N" HIC "之力卸去。\n" NOR;
        }
        message_sort(msg, me, target);

        // 第二招，判断对方悟性
        dp = target->query_int() * 2 + target->query_skill("dodge", 1) 
             + target->query_skill("parry", 1);

        message_sort(HIW "\n$N" HIW "肌肤如欲胀裂，内息不由自主的依着‘赵客缦胡缨’那套经脉运"
                     "行图谱转动，同时手舞足蹈，似是大欢喜，又似大苦恼。\n" NOR, me);

        if (ap * 4 / 5 + random(ap) > dp)
        {
                damage = ap + random(ap);
                msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 95 + random(10),
                                          HIY "$n" HIY "冷笑一声，觉得$N" HIY "此招肤浅之极，于"
                                          "是随意招架，猛然间，「噗嗤」！一声，" + weapon->name() +
                                          HIY "已穿透$n" HIY "的胸膛，鲜血不断涌出。\n" NOR, me , target);
        } else
        {
                msg = HIC "$n" HIC "会心一笑，看出$N" HIC "这招中的破绽，随意施招竟将这招化去。\n" NOR;
        }
        message_sort(msg, me, target);

        // 第三招，判断对方根骨
        dp = target->query_con() * 2 + target->query_skill("force", 1) + 
             target->query_skill("parry", 1);

        message_sort(HIW "\n‘赵客缦胡缨’既毕，接下去便是‘吴钩霜雪明’，$N" HIW "更"
                    "不思索，石壁上的图谱一幅幅在脑海中自然涌出，自‘银鞍照白马’直到‘谁能书阁下’，"
                    "一气呵成的使了出来。\n" NOR, me);

        if (ap * 4 / 5 + random(ap) > dp)
        {
                damage = ap + random(ap);
                msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 80 + random(10),
                                           (: final2, me, target, damage :));
        } else
        {
                msg = HIC "$n" HIC "默运内功，内劲贯于全身，奋力抵挡住$N" HIC "这招。\n" NOR;
        }
        message_sort(msg, me, target);

        // 第四招，判断对方身法
        dp = target->query_dex() * 2 + target->query_skill("dodge", 1) + 
             target->query_skill("parry", 1);

        message_sort(HIW "\n待得‘谁能书阁下’这套功夫演完，$N" HIW "只觉气息逆转"
                     "，‘不惭世上英’倒使上去。\n" NOR, me);

        if (ap * 4 / 5 + random(ap) > dp)
        {
                damage = ap + random(ap);
                msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 80 + random(10),
                                          (: final3, me, target, damage, weapon, lvl, sub_msg :));
        } else
        {
                msg = HIC "$n" HIC "见这招来势凶猛，身形疾退，瞬间飘出三"
                      "丈，方才躲过$N" HIC "这招。\n" NOR;
        }
        message_sort(msg, me, target);

        me->start_busy(2 + random(3));
        me->add("neili", -400 - random(400));
        return 1;
}

string final1(object me, object target, int damage, object weapon, int lvl)
{
        target->add("neili", -(lvl + random(lvl)));

        return  HIY "$n" HIY "却觉$N" HIY "这招气势恢弘，于是运力奋力抵挡。但是无奈这"
                "招威力惊人，$n" HIY "闷哼一声，倒退几步，顿觉内息涣散，" + weapon->name() + HIY 
                "上早已染满鲜血！\n" NOR;
}

string final2(object me, object target, int damage)
{
        target->receive_damage("jing", damage / 2, me);
        target->receive_wound("jing", damage / 4, me);
        return  HIY "$n" HIY "心中一惊，但见$N" HIY "这几招奇异无比，招式变化莫测，"
                "但威力却依然不减，正犹豫间，$n" HIY "却已中招，顿感精力不济，浑"
                "身无力。\n" NOR;
}

string final3(object me, object target, int damage, object weapon, int lvl, string msg)
{
   
        target->start_busy(4 + random(lvl / 40));
  
        return  HIY "$N" HIY + msg + "法奇妙无比，手中" + weapon->name() + HIY "时而宛若游龙，时而"
                "宛若惊鸿，霎那间$n" HIY "已遍体鳞伤，$N" HIY "猛然将手中" + weapon->name() + HIY "一"
                "转，剑势陡然加快，将$n" HIY "团团围住，竟无一丝空隙！\n" NOR;

}