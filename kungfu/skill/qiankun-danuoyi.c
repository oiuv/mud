inherit SKILL;

#include <ansi.h>
#include <combat.h>

string *parry_msg = ({
        "$N一招击在$n身上，却被$n暗运乾坤大挪移，将内力尽数移入地下。\n",
        "$n轻轻一带，$N发现自己招数回击过来，吓得往后倒退几步。\n",
        "$n手臂回转，在$N手肘下轻轻一推，$N招数落空。\n",
        "$n右手伸出，在$N手腕上轻轻一拉，$N收势不住，直往前扑去。\n",
        "$n身形不动，$N一招击下，有如石沉大海，不觉呆住了。\n",
        "$n左牵右引，$N如身处漩流，连续转了好几个圈子。\n",
        "$n双手回圈，$N只觉得前面好象有一堵墙，再也攻不进去。\n",
        "$n轻轻一转，$N一招击在地上，只打得尘土飞扬。\n",
});

string *pfail_msg = ({
        "$n暗运乾坤大挪移，试图将内力尽数移入地下，然而$N早已勘破其中奥妙，内力变化莫测。\n",
        "$n轻轻一带，$N发现自己招数回击过来，急忙变招，身转如意，反让$n防不胜防。\n",
        "$n手臂回转，在$N手肘下轻轻一推，然而$N招数忽的一变，并未落空。\n",
        "$n右手伸出，在$N手腕上轻轻一拉，$N收势不住，顺势变招扑前直击。\n",
        "$n左牵右引，$N如身处漩流，顺势变招，圆转如意，随心所欲。\n",
        "$n双手回圈，$N只觉得前面好象有一堵墙，猛然警醒，聚力于一点，力攻对方。\n",
});

int valid_enable(string usage) 
{ 
        return usage == "parry";
}

string query_parry_msg(string limb)
{
        return parry_msg[random(sizeof(parry_msg))];
}

int valid_learn(object me)
{
        int layer;

        if (me->query("gender") == "无性" &&
            me->query_skill("qiankun-danuoyi", 1) >= 50)
                return notify_fail("你试图按照心法修炼大挪移，却"
                                   "觉得心中一阵迷茫，难以继续。\n");

        if (me->query_condition("qiankun-except"))
                return notify_fail("你现在体内若冰、四肢皆寒、面赤"
                                   "如火，无法继续修炼神功。\n");

        layer = (int)me->query_skill("qiankun-danuoyi", 1) / 50;
        if (layer > 7) layer = 7;

		if (me->query("int") < 36 )
                return notify_fail("你觉得乾坤大挪移实在是深奥无比，全然无法理解。\n");

        //if (me->query("int") < 32 + layer )
        //      return notify_fail("你觉得第" + chinese_number(layer) +
        //                          "层乾坤大挪移实在是深奥无比，全然无法理解。\n");

		if (me->query("int") < 43 + layer - (int)me->query_skill("force")/50)
                return notify_fail("你觉得第" + chinese_number(layer) +
                                   "层乾坤大挪移实在是深奥无比，全然无法理解。\n");

        if ((int)me->query("max_neili") < 5000)
                return notify_fail("你的内力修为太差，无法修炼乾坤大挪移。\n");
        
        if ((int)me->query_skill("force") < 450)
                return notify_fail("你的内功火候不够，无法修炼乾坤大挪移。\n");

        if ((int)me->query_skill("parry", 1) < (int)me->query_skill("qiankun-danuoyi", 1))
                return notify_fail("你的基本招架火候有限，无法体会更高深的乾坤大挪移。\n");

       // if ((int)me->query_skill("dodge", 1) < (int)me->query_skill("qiankun-danuoyi", 1))
       //         return notify_fail("你的基本轻功火候有限，无法体会更高深的乾坤大挪移。\n");

        if ((int)me->query_skill("force", 1) < (int)me->query_skill("qiankun-danuoyi", 1))
                return notify_fail("你的基本内功火候有限，无法体会更高深的乾坤大挪移。\n");

        return 1;
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mapping result;
        string msg;
        int ap, dp, mp, sk, ma, wn, na;

        sk = ob->query_skills();
        ma = ob->query_skill_map();

        if ((int)me->query_skill("qiankun-danuoyi", 1) < 100
           || ! living(me))
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("force", 1) + mp;
        dp = me->query_skill("parry", 1);

        if (ap / 2 + random(ap) < dp
           && ! me->is_busy()
           && ! me->query_temp("nuoyi")
           && ! ob->query_temp("nuoyi")
           && me->query_skill("qiankun-danuoyi", 1) > 350
           && me->query("max_neili") * 2 / 3 > ob->query("max_neili")
           && random(30) == 1
           && sizeof(sk)
           && sizeof(ma) != 0
           && mapp(ma)
           && mp < 100)
        {
                if (objectp(weapon = ob->query_temp("weapon")))
		{
			wn = weapon->query("skill_type");
			na = ob->query_skill_mapped(wn);
		} else

		if (ob->query_skill_prepared("finger"))
			na = ob->query_skill_mapped("finger");
		else

		if (ob->query_skill_prepared("strike"))
			na = ob->query_skill_mapped("strike");
		else

		if (ob->query_skill_prepared("claw"))
			na = ob->query_skill_mapped("claw");
		else

		if (ob->query_skill_prepared("cuff"))
			na = ob->query_skill_mapped("cuff");
		else

		if (ob->query_skill_prepared("hand"))
			na = ob->query_skill_mapped("hand");
		else
			na = ob->query_skill_mapped("unarmed");

                msg = HIM "\n$N" HIM "一招攻出，却见$n" HIM "迎身而"
                      "上，冷笑道：「区区" + CHINESE_D->chinese(na) +
                      HIM "，能奈我何？」\n$n" HIM "当即运起乾坤大挪"
                      "移第七层心法，企图挪移$N" HIM "的攻势。\n\n" NOR;

                me->start_call_out((: call_other, __FILE__, "nuoyi",
                                      ob, me :), 1);
                me->set_temp("nuoyi/" + ob->query("id"), 1);
                me->start_busy(2);

                result = ([ "damage" : -damage,
                            "msg"    : msg ]);

                return result;
        } else

        if (ap / 2 + random(ap) < dp)
        {
                msg = parry_msg[random(sizeof(parry_msg))];
                msg = replace_string(msg, "$N", "$N" HIG);
                msg = replace_string(msg, "$n", "$n" HIG);
                msg = HIG + msg + NOR;

                result = ([ "damage": -damage,
                            "msg"   : msg ]);

                return result;
        } else

        if (mp >= 100)
        {
                msg = pfail_msg[random(sizeof(pfail_msg))];
                msg = replace_string(msg, "$N", "$N" HIY);
                msg = replace_string(msg, "$n", "$n" HIY);
                msg = HIY + msg + NOR;
                COMBAT_D->set_bhinfo(msg);
        }
}

void skill_improved(object me)
{
        int lvl;
        int layer;

        lvl = me->query_skill("qiankun-danuoyi", 1);
        layer = lvl / 50;
        if (layer > 7) layer = 7;

        if (! layer)
        {
                tell_object(me, HIM "你潜心修炼乾坤大挪"
                            "移心法，若有所悟。\n" NOR);
        } else
        if ((lvl % 50) == 0)
        {
                tell_object(me, HIM "你修炼成了第" + chinese_number(layer) +
                            "层的乾坤大挪移心法。\n" NOR);
        } else
                tell_object(me, HIM "你对第" + chinese_number(layer) +
                            "层的乾坤大挪移心法又加深了一层了解。\n" NOR);

        if (lvl > me->query_skill("force") * 2 / 3)
        {
                if (lvl < me->query_skill("force") * 2 / 3 + 10)
                {
                        tell_object(me, HIG "你觉得内息一阵紊乱，丹田时冷时"
                                        "热，不由得大吃一惊。\n心想莫非是走"
                                        "火入魔？丹田越来越是寒冷，极为难受"
                                        "。\n" NOR);

                        message("vision", HIG + me->name() + HIG "的脸色忽红"
                                          "忽绿，变得不停，只是浑身颤抖，似"
                                          "乎十分痛苦。\n" NOR,
                                          environment(me), ({ me }));
                        return;
                }
                tell_object(me, HIB "你忽然觉得丹田腾起一阵寒意，霎时间四肢"
                                "百赅一起变得寒冷无比，忍不住大声呻吟。\n" NOR);

                message("vision", HIB + me->name() + HIB "忽然一抖，脸色忽然"
                                  "变得惨白，隐然笼罩了一股绿气，呻吟不止。"
                                  "\n" NOR, environment(me), ({ me }));
        } else

        if (lvl < 350 && (lvl * 15 + 4000) > me->query("max_neili"))
        {
                if ((lvl * 15 + 4000) < me->query("max_neili") + 200)
                {
                        tell_object(me, HIR "你试着运转了一下内息，一时觉得内"
                              "力不济，看来还是不要贸然修炼大挪移神功。\n" NOR);
                        return;
                }

                tell_object(me, HIR "你试着运转了一下内息，忽然觉得一口气"
                      "竟然转不过来，顿时心中绞痛，接连吐了几口鲜血。\n" NOR);
                message("vision", HIR + me->name() + HIR "脸色忽然"
                        "一变，呕出几口鲜血，触目惊心。\n" NOR,
                        environment(me), ({ me }));
        } else
                return;

        me->apply_condition("qiankun-except", lvl +
           (int)me->query_condition("qiankun-except"));
}

void nuoyi(object ob, object me)
{
        string msg;
        int ap, dp, damage;

        if (! ob
           || ! me->is_fighting(ob)
           || ! me->query_temp("nuoyi/" + ob->query("id")))
                return;

        msg = HIM "\n$N" HIM "乾坤大挪移第七层心法施展出来，顿将先前所积蓄"
              "的十余道力量归并为一掌，朝$n" HIM "疾拍而出，这便如一座大湖"
              "在山洪爆发时储满了洪水却突然崩决，洪水急冲而出一般。\n" NOR;

        ap = me->query_skill("parry");
        dp = ob->query_skill("force");

        me->start_busy(2);

        if (dp / 2 + random(dp) < ap)
        {
                damage = ap + dp;
                msg += COMBAT_D->do_damage(me, ob, REMOTE_ATTACK, damage, 300,
                                           HIR "只听$n" HIR "一声惨叫，将$N"
                                           HIR "返回的力道受了个十足，全身喀"
                                           "嚓喀嚓一阵脆响，腕骨、臂骨、肩骨"
                                           "、肋骨竟然一齐折断。\n" NOR);
        } else
        {
                msg += HIC "$n" HIC "眼见$P来势汹涌，不敢"
                       "大意，施出浑身解数化解开来。\n" NOR;
        }
        me->delete_temp("nuoyi");
        message_sort(msg, me, ob);
}

int practice_skill(object me)
{
        return notify_fail("乾坤大挪移只能通过学习或研读乾坤大挪移心法提高。\n");
}

string perform_action_file(string func)
{
        return __DIR__"qiankun-danuoyi/" + func;
}