// kuihua-shengong 葵花魔功

inherit FORCE;
#include <ansi.h>

string *dodge_msg = ({
        "$n微微一动，已然远去，使$N的进攻全然无用。\n",
        "$n霎时间平移了数步，如鬼如魅，使$N全然无法掌握。\n",
        "$n忽的一退，闪去天下任何追击。\n",
        "$n足不离地，腰肢猛摆，居然将$N的进攻全部躲过。\n",
});

string *finger_name = ({ "左手中指", "左手无名指", "左手食指",
                         "右手中指", "右手无名指", "右手食指", }); 

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("kuihua-mogong", 1);
        return lvl * lvl * 18 * 15 / 100 / 200;
}

mapping *actionf = ({
([      "action":"$N倏的近前，身形快极，手指戳向$n的$l",
        "force" : 410,
        "attack": 182,
        "dodge" : 215,
        "parry" : 60,
        "damage": 190,
        "damage_type":  "刺伤"
]),
([      "action":"$N扑向前来，身形如同鬼魅，令人难以捉摸，手指忽的刺向$n的$l",
        "force" : 410,
        "attack": 180,
        "dodge" : 224,
        "parry" : 70,
        "damage": 200,
        "damage_type":  "刺伤"
]),
([      "action":"$N身形一转，手指刺出，直指$n的$l",
        "force" : 430,
        "attack": 175,
        "dodge" : 220,
        "parry" : 50,
        "damage": 210,
        "damage_type":  "刺伤"
]),
([      "action":"$N飘然远去，忽又进前，速度快的不可思议，一指如闪电般刺向$n的$l",
        "force" : 445,
        "attack": 180,
        "dodge" : 255,
        "parry" : 65,
        "damage": 190,
        "damage_type":  "刺伤"
]),
([      "action":"$N身体一晃，突然飞起一脚，踢向$n的$l",
        "force" : 450,
        "attack": 200,
        "dodge" : 250,
        "parry" : 55,
        "damage": 200,
        "damage_type":  "瘀伤"
]),
([      "action":"$N足下疾走，身形变幻莫测，突然一指插向$n的$l",
        "force" : 450,
        "attack": 215,
        "dodge" : 285,
        "parry" : 55,
        "damage": 220,
        "damage_type":  "刺伤"
]),
});

mapping *actionw = ({
([      "action":"$N倏的近前，身形快极，手中的$w戳向$n的$l",
        "force" : 460,
        "attack": 200,
        "dodge" : 150,
        "parry" : 40,
        "damage": 300,
        "damage_type":  "刺伤"
]),
([      "action":"$N扑向前来，身形如同鬼魅，令人难以捉摸，手中的$w忽的刺向$n的$l",
        "force" : 490,
        "attack": 185,
        "dodge" : 160,
        "parry" : 45,
        "damage": 300,
        "damage_type":  "刺伤"
]),
([      "action":"$N身形一转，$w刺出，直指$n的$l",
        "force" : 465,
        "attack": 210,
        "dodge" : 180,
        "parry" : 45,
        "damage": 300,
        "damage_type":  "刺伤"
]),
([      "action":"$N飘然远去，忽又进前，速度快的不可思议，$w如闪电般刺向$n的$l",
        "force" : 480,
        "attack": 190,
        "dodge" : 195,
        "parry" : 55,
        "damage": 300,
        "damage_type":  "刺伤"
]),
([      "action":"$N身体一晃，突然飞起一脚踢向$n的下阴，蓦的又收回，反手$w刺向$n的$l",
        "force" : 500,
        "attack": 220,
        "dodge" : 180,
        "parry" : 57,
        "damage": 300,
        "damage_type":  "刺伤"
]),
([      "action":"$N足下疾走，身形变幻莫测，突然一扬手，$w飞也似的插向$n的$l",
        "force" : 520,
        "attack": 260,
        "dodge" : 195,
        "parry" : 50,
        "damage": 300,
        "damage_type":  "刺伤"
]),
});

string *usage_skills = ({ "unarmed", "sword", "dodge",
                          "parry", "force" });

int valid_enable(string usage)
{
        return (member_array(usage, usage_skills) != -1);
}

int valid_combo(string combo)
{
        return combo == "kuihua-mogong";
}

int valid_force(string force) { return 1; }

int double_attack() { return 1; }

mapping query_action(object me, object weapon)
{
        return weapon ? actionw[random(sizeof(actionw))] :
                        actionf[random(sizeof(actionw))];
}

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int valid_learn(object me)
{
        int level;
        int i;

        if ((int)me->query("combat_exp") < 3000000)
                return notify_fail("你觉得葵花魔功深奥之极，"
                                   "凭自己的战斗经验一时间难以领会。\n");

        if ((int)me->query_skill("martial-cognize", 1) < 150)
                return notify_fail("你觉得葵花魔功过于深奥之极，以"
                                   "自己的武学修养全然无法明白。\n");

        if (me->query("character") != "阴险奸诈"
           && me->query("character") != "心狠手辣" && me->query("character") != "国士无双")
                return notify_fail("你看了葵花魔功这些阴险毒辣的武功，不"
                                   "由的心惊肉跳，难以领会。\n");

        if (me->query("dex") < 38)
                return notify_fail("你觉得自己的身法不够灵动，不可能掌握这么飘缈"
                                   "玄奇的葵花魔功。\n");
 
        if (me->query("int") < 34)
                return notify_fail("你觉得自己的先天悟性不够，不可能领悟这么高深"
                                   "玄奇的葵花魔功。\n");

        level = me->query_skill("kuihua-mogong", 1);
		
		// 武学修养超过500时，取消武学修养对葵花魔攻的限制 by MK
        if ((int)me->query_skill("martial-cognize", 1) < level && (int)me->query_skill("martial-cognize", 1)<500)
                return notify_fail("你觉得自己的武学修养有限，难以领会更高深的葵花魔功。\n");

        for (i = 0; i < sizeof(usage_skills); i++)
                if (me->query_skill(usage_skills[i], 1) < level)
                        return notify_fail("你对" + to_chinese(usage_skills[i]) +
                                           "的理解还不够，无法继续领会更高深的葵花魔功。\n");

        return 1;
}

int practice_skill(object me)
{
        return notify_fail("葵花魔功博大精深，无法简单的通过练习进步。\n");
}
/*
int difficult_level()
{
        return 1400;
}
*/

//转世特技六阴鬼脉降低研究难度 by 薪有所属
//无鬼脉特技研究难度降低，基本平衡4大终极武功 by MK
int difficult_level()
{
     object me; 
     int lv;
     me = this_player(); 
     lv = me->query_skill("kuihua-mogong", 1) - 250; 
     if (lv > 200) lv = 200; 
     
     if (! me->query("special_skill/guimai"))
        return 1400 - lv;
     else
        return 1200 - lv;
}

int query_effect_dodge(object attacker, object me)
{
        int lvl;

        lvl = me->query_skill("kuihua-mogong", 1);
        if (lvl <= 200) return 70;
        if (lvl < 250) return 90;
        if (lvl < 300) return 100;
        if (lvl < 350) return 115;
        return 130;
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;

        if ((int)me->query_skill("kuihua-mogong", 1) < 210 ||
            ! living(me) ||
            me->query_skill_mapped("dodge") != "kuihua-mogong")
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("dodge") + mp;
        dp = me->query_skill("dodge", 1) / 2 +
             me->query_skill("kuihua-mogong", 1);

        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage": -damage ]);

                switch (random(4))
                {
                case 0:
                        result += (["msg" : HIW "$N" HIW "眼睛一花，$n" HIW "已没了踪"
                                            "影。突然$n" HIW "从身后拍了一下$N" HIW "的"
                                            "头，轻轻跃开。\n" NOR]);
                        break;
                case 1:
                        result += (["msg" : HIW "$N" HIW "眼前一花，似乎见到$n" HIW "身"
                                            "形一晃，但随即又见$n" HIW "回到原地，却似"
                                            "从未离开。\n" NOR]);
                        break;
                case 2:
                        result += (["msg" : HIW "$n" HIW "尖啸一声，忽然身子一转已不见了踪影，$N" HIW
                                           "只觉耳边风声不断，但随即又见$n" HIW "回到了原地。\n" NOR]);
                        break;
                default:
                        result += (["msg" : HIW "忽然间，只见$n" HIW "腰枝一摆，顿时出现无数个"
                                            "$n" HIW "的影子，$N" HIW "却无法辨别出$n" HIW "的方位。\n" NOR]);
                        break;
                }
                return result;
        } else
        if (mp >= 100)
        {
                switch (random(4))
                {
                case 0:
                        result = HIY "$N" HIY "眼睛一花，$n" HIY "已没了踪影"
                                 "。可是$N" HIY "精通易理，丝毫不为所乱，尽自"
                                 "出招。\n" NOR;
                        break;
                case 1:
                        result = HIY "$N" HIY "眼前一花，似乎见到$n" HIY "身"
                                 "形一晃。$N" HIY "一声冷笑，已瞬间看破招中虚"
                                 "实。\n" NOR;
                        break;
                case 2:
                        result = HIY "$n" HIY "身形飘忽，有如鬼魅，转了几转，"
                                 "可是$N" HIY "理也不理，连续数招径直攻出。\n"
                                 NOR;
                        break;
                default:
                        result = HIY "突然间白影急晃，$n" HIY "身形顿时化分成万千身影，"
                                 "可是$N" HIY "不假思索，追身攻上，更是巧妙无"
                                 "方。\n" NOR;
                        break;
                }
                COMBAT_D->set_bhinfo(result);
        }
}


mixed hit_ob(object me, object victim, int damage_bonus, int i, int attack_time)
{
        object weapon;
        string name;

        weapon = me->query_temp("weapon");

        if (me->query_temp("weapon"))
	        name = "手中" + weapon->name();
        else
	        name = finger_name[random(sizeof(finger_name))];

        attack_time = (int)(me->query_skill("kuihua-mogong", 1) / 40);

        if (attack_time > 9)
                attack_time = 9;

        if (me->is_busy()
           || random(2) == 0
           || ! living(victim)
           || damage_bonus < 120
           || me->query("neili") < 300
           || me->query_temp("action_flag") == 0
           || me->query_skill("kuihua-mogong", 1) < 200)
        	return 0;

        // 避免在使用Pfm时讯息重复
        if (! me->query_temp("kuihua-mogong/hit_msg"))
	        message_vision(HIW "\n霎时间只见$N" HIW "身子猛摆，顿时化分为无数身影，" + name +
        	               HIW "宛若流星般分从不同的方位同时刺向$n" HIW "！\n"
                	       NOR, me, victim);

	me->start_busy(1 + random(attack_time));
        me->add("neili", -attack_time * 30);
        me->set_temp("action_flag", 1);
        for (i = 0; i < attack_time; i++)
        {
                if (! me->is_fighting(victim))
                        break;
                COMBAT_D->do_attack(me, victim, weapon, 0);
        }
        me->delete_temp("action_flag");

        return 1;
}
string perform_action_file(string action)
{
        return __DIR__"kuihua-mogong/perform/" + action;
}

string exert_function_file(string action)
{
        return __DIR__"kuihua-mogong/exert/" + action;
}
