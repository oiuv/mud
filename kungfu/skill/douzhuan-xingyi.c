// douzhuan-xingyi 斗转星移

#include <ansi.h>
#include <combat.h>

inherit SKILL;

string *parry_msg = ({
        "只听见「锵」一声，$n用兵刃轻轻一托，化解了$N这一击。\n",
        "但是被$n用手中兵刃卸开。\n",
        "但是$n身子一侧，随手转动手中的兵刃，让$N感觉到有力难施。\n",
});

string *unarmed_parry_msg = ({
        "但是被$p双掌一推，$N的攻势顿时变了方向。\n",
        "$n身形一转，$N只觉得的所有的力道全部都落到了空处。\n",
        "但是$N感觉像打到棉花上一样，说不出的怪异。\n",
});

string query_parry_msg(object weapon)
{
        if( weapon )
                return parry_msg[random(sizeof(parry_msg))];
        else
                return unarmed_parry_msg[random(sizeof(unarmed_parry_msg))];
}

int valid_enable(string usage) { return usage == "parry"; }

int valid_learn(object me)
{
          if ((int)me->query_skill("murong-xinfa", 1) < 100)
                  return notify_fail("你的慕容心法火候还不够，不能学习斗转星移。\n");

        if ((int)me->query_skill("parry", 1) < 100)
                return notify_fail("你的基本招架技巧掌握的还不够熟练，无法学习斗转星移。\n");

        return 1;
}

int practice_skill(object me)
{
	return notify_fail("斗转星移只能用学(learn)的来增加熟练度。\n");
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;
        int lvl, ran;
        string msg;

        if ((int) me->query_skill("douzhuan-xingyi", 1) < 100 ||
              ! living(me) || me->query_skill("zihui-xinfa",1) < 100)
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("force", 1) + mp;
        dp = me->query_skill("parry", 1);
 
        lvl = me->query_skill("douzhuan-xingyi", 1);
      
        // 特殊反伤害几率
        if (lvl > 280)ran = 50;
        if (lvl > 300)ran = 45;
        if (lvl > 320)ran = 35;
        if (lvl > 350)ran = 30;
        if (lvl > 380)ran = 20;
        if (lvl > 400)ran = 10;
        if (lvl > 450)ran = 8;
        if (lvl > 500)ran = 6;

        // 斗转星移反伤效果
        if (lvl > 280 &&
            me->query_skill("zihui-xinfa", 1) > 300 &&
            ! me->is_busy() &&
            me->query("max_neili") * 2 / 3 > ob->query("max_neili") &&
            me->query("neili") > 500 &&
            mp < 100 &&
            random(ran) == 1 )
        {
                msg = HIM "\n$N" HIM "默运紫徽心法，施展起绝学「斗转星移」，一股真气在体内迅速惯行，"
                      "巧妙地牵引着$n" HIM "的招式。\n" NOR;

                ap = me->query_skill("parry");
                dp = ob->query_skill("force");

                me->add("neili", -150);

                if (dp / 2 + random(dp) < ap)
                {
                      damage = ap + dp;
                      msg += COMBAT_D->do_damage(me, ob, REMOTE_ATTACK, damage, 200,
                                                 HIR "\n$n" HIR "大吃一惊，不料$N" HIR "竟将"
                                                 "$p" HIR"先前的招式尽数折回反攻向自己。\n猛"
                                                 "然间$n" HIR "一声惨呼，已然闪避不及。\n" NOR);
                } else {

                      msg += HIC "$n" HIC "眼见$P来势汹涌，不敢"
                             "大意，施出浑身解数化解开来。\n" NOR;
                }
                
                message_sort(msg, me, ob);

                result = ([ "damage" : -damage ]);
                result += ([ "msg" : msg ]);

                return result;
                
        } else
           
        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage" : -damage ]);

                switch (random(3))
                {
                case 0:
                        result += ([ "msg" : HIC "$n" HIC "身形忽然转个不停，$N"
                                             HIC "这一招竟然无从下手。\n" NOR ]);
                        break;
                case 1:
                        result += ([ "msg" : HIC "$n" HIC "单掌一托，$N"
                                             HIC "登时拿捏不准力道，不禁"
                                            "泛起一阵有心无力的感觉。\n" NOR ]);
                        break;

                default:
                        result += ([ "msg" : HIC "$N" HIC "一招眼看击中了$n"
                                             HIC "，然而$n" HIC "轻轻一卸，"
                                             "将$N" HIC "的攻击化解于无形。\n" NOR ]);
                        break;
                }
                return result;
        } else

        if (mp >= 100)
        {
                switch (random(3))
                {
                case 0:
                        result = HIY "$n" HIY "身形忽然转个不停，然而$N"
                                 HIY "早已看穿其中奥妙，丝毫不受影响，挥招直入。\n" NOR;
                        break;

                case 1:
                        result = HIY "$n" HIY "单掌一托，$N"
                                 HIY "忽感拿捏不准力道，蓦然警醒，登时变化招式。\n" NOR;
                        break;

                default:
                        result = HIY "$n" HIY "轻轻一卸力，但是$N"
                                 HIY "已然看出其中四两拨千金的变化，左右腾挪，让$n"
                                 HIY "如意算盘就此落空。\n" NOR;
                        break;
                }
                COMBAT_D->set_bhinfo(result);
        }
}

string perform_action_file(string action)
{
        return __DIR__"douzhuan-xingyi/" + action;
}
