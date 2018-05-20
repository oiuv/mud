#include <ansi.h>
inherit FORCE;
inherit SKILL;

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("pixie-jian", 1);
        if (me->query("special_skill/guimai"))
                return lvl * lvl * 20 * 15 / 100 / 200;
        else
                return lvl * lvl * 12 * 15 / 100 / 200;
}

string *dodge_msg = ({
        "突然之间，白影急幌，$n向后滑出丈余，立时又回到了原地，躲过了$N这一招。\n",
        "$n手臂回转，在$N手肘下一推，顺势闪到一旁。\n",
        "$n右手伸出，在$N手腕上迅速无比的一按，顺势跳到一旁。\n",
        "$n身形飘忽，有如鬼魅，转了几转，移步到$N的身后，躲过了$N这一招。\n",
        "$N只觉眼前一花，似乎见到$n身形一幌，但随即又见$n回到原地，却似从未离开。\n",
        "$N眼睛一花，$n已没了踪影。突然$n从身后拍了一下$N的头，轻轻跃开。\n",
        "$n嫣然一笑，诡异之极，$N竟不知如何是好，停住了攻击。\n",
});

string *finger_name = ({ "左手中指", "左手无名指", "左手食指",
                         "右手中指", "右手无名指", "右手食指", }); 

mapping *action = ({
([  	"action":"突然之间，白影急幌，$N向后滑出丈余，立时又回到了原地",
    	"force" : 160,
    	"attack": 40,
    	"parry" : 30,
    	"dodge" : 120,
    	"damage": 150,
    	"lvl" : 0,
    	"skill_name" : "白影急幌",
    	"damage_type":  "刺伤"
]),
([  	"action":"$N右手伸出，在$n手腕上迅速无比的一按，$n险些击中自己小腹",    
    	"force" : 180,
    	"attack": 50,
    	"parry" : 30,
    	"dodge" : 135,
    	"damage": 160,
    	"lvl" : 20,
    	"skill_name" : "自己小腹",
    	"damage_type":  "刺伤"
]),
([  	"action":"蓦地里$N猱身而上，蹿到$n的身后，又跃回原地",
    	"force" : 225,
    	"attack": 60,
    	"parry" : 35,
    	"dodge" : 155,
    	"damage": 170,
    	"lvl" : 40,
    	"skill_name" : "猱身而上",
    	"damage_type":  "刺伤"
]),
([  	"action":"$N突然间招法一变，$w忽伸忽缩，招式诡奇绝伦。$n惊骇之中方寸大乱",
    	"force" : 230,
    	"attack": 70,
    	"parry" : 40,
    	"dodge" : 160,
    	"damage": 180,
    	"lvl" : 60,
    	"skill_name" : "招法一变",
    	"damage_type":  "刺伤"
]),
([  	"action":"$N身形飘忽，有如鬼魅，转了几转，移步到$n的左侧",
    	"force" : 240,
    	"attack": 80,
    	"parry" : 50,
    	"dodge" : 170,
    	"damage": 200,
    	"lvl" : 80,
    	"skill_name" : "有如鬼魅",
    	"damage_type":  "刺伤"
]),
([  	"action":"$N一声冷笑，蓦地里疾冲上前，一瞬之间，与$n相距已不到一尺，$w随即递出",
    	"force" : 260,
    	"attack": 70,
    	"parry" : 40,
    	"dodge" : 165,
    	"damage": 220,
    	"lvl" : 100,
    	"skill_name" : "疾冲上前",
    	"damage_type":  "刺伤"
]),
([  	"action":"$N喝道：“好！”，便即拔出$w，反手刺出，跟着转身离去",
    	"force" : 300,
    	"attack": 90,
    	"parry" : 45,
    	"dodge" : 180,
    	"damage": 230,
    	"lvl" : 120,
    	"skill_name" : "反手刺出",
    	"damage_type":  "刺伤"
]),
([  	"action":"$n只觉眼前一花，似乎见到$N身形一幌，但随即又见$N回到原地，却似从未离开",
    	"force" : 340,
    	"attack": 80,
    	"parry" : 40,
    	"dodge" : 185,
    	"damage": 250,
    	"lvl" : 140,
    	"skill_name" : "眼前一花",
    	"damage_type":  "刺伤"
]),
([  	"action":"$N向后疾退，$n紧追两步，突然间$N闪到$n面前，手中$w直指$n的$l",
    	"force" : 380,
    	"attack": 100,
    	"parry" : 50,
    	"dodge" : 190,
    	"damage": 270,
    	"lvl" : 160,
    	"skill_name" : "向后疾退",
    	"damage_type":  "刺伤"
]),
([  	"action":"$N蓦地冲到$n面前，手中$w直刺$n右眼！$n慌忙招架，不想$N的$w突然转向",
    	"force" : 410,
    	"attack": 130,
    	"parry" : 55,
    	"dodge" : 210,
    	"damage": 300,
    	"lvl" : 180,
    	"skill_name" : "直刺右眼",
    	"damage_type":  "刺伤"
]),
([  	"action":"$N飞身跃起，$n抬眼一望，但见得$N从天直落而下，手中$w刺向$n的$l",
    	"force" : 440,
    	"attack": 130,
    	"parry" : 50,
    	"dodge" : 230,
    	"damage": 320,
    	"lvl" : 200,
    	"skill_name" : "飞身跃起",
    	"damage_type":  "刺伤"
]),
([  	"action":"$N腰枝猛摆，$n眼前仿佛突然出现了七八个$N，七八只$w一起刺向$n",
    	"force" : 480,
    	"attack": 140,
    	"parry" : 60,
    	"dodge" : 270,
    	"damage": 340,
    	"lvl" : 220,
    	"skill_name" : "腰枝猛摆",
    	"damage_type":  "刺伤"
]),
});

int valid_enable(string usage)
{
        return usage == "sword" ||
               usage == "dodge" ||
               usage == "parry" ||
               usage == "force" ||
               usage == "unarmed";
}

int double_attack() { return 1; }

int valid_learn(object me)
{
        if (me->query("character") == "光明磊落" ||
           me->query("character") == "狡黠多变")
                return notify_fail("你心中暗道：这辟邪剑法损人损己，修炼来何用。\n");
//转世特技六阴鬼脉取消女性限制 by 薪有所属
        if (me->query("gender") == "女性" && ! me->query("special_skill/guimai"))
                return notify_fail("自古以来没听说过女人可以修习葵花宝典。\n");
//转世特技六阴鬼脉取消男性限制  by 薪有所属
        if (me->query("gender") == "男性" && ! me->query("special_skill/guimai"))
        {
                me->receive_wound("qi", 50);
                return notify_fail(HIR "\n你试着修炼辟邪剑法，霎时只觉内息忽然大"
                                   "乱，几欲焚身。\n" NOR);
        }

        if (me->query("int") < 34)
                return notify_fail("你的天资不足，无法理解辟邪剑法的深意。\n");

        if (me->query("dex") < 32)
                return notify_fail("你先天身法孱弱，难以修炼辟邪剑法。\n");

        if (me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法造诣太浅，无法理解辟邪剑法。\n");

        if (me->query_skill("dodge", 1) < 100)
                return notify_fail("你的基本轻功造诣太浅，无法理解辟邪剑法。\n");

        if (me->query_skill("parry", 1) < 100)
                return notify_fail("你的基本架造造诣太浅，无法理解辟邪剑法。\n");

        if (me->query_skill("force", 1) < 100)
                return notify_fail("你的基本内功造诣太浅，无法理解辟邪剑法。\n");

        if (me->query_skill("sword", 1) < me->query_skill("pixie-jian", 1))
                return notify_fail("你的基本剑法造诣有限，无法理解更高深的辟邪剑法。\n");

        if (me->query_skill("dodge", 1) < me->query_skill("pixie-jian", 1))
                return notify_fail("你的基本轻功造诣有限，无法理解更高深的辟邪剑法。\n");

        if (me->query_skill("parry", 1) < me->query_skill("pixie-jian", 1))
                return notify_fail("你的基本招架造诣有限，无法理解更高深的辟邪剑法。\n");

        if (me->query_skill("unarmed", 1) < me->query_skill("pixie-jian", 1))
                return notify_fail("你的基本拳脚造诣有限，无法理解更高深的辟邪剑法。\n");

        if (me->query_skill("force", 1) < me->query_skill("pixie-jian", 1))
                return notify_fail("你的基本内功造诣有限，无法理解更高深的辟邪剑法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("pixie-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;

        if ((int)me->query_skill("pixie-jian", 1) < 100 ||
			me->query_skill_mapped("force") != "pixie-jian" ||
			me->query_skill_mapped("dodge") != "pixie-jian" ||
			me->query_skill_mapped("parry") != "pixie-jian" ||
            ! living(me))
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("dodge") + mp;
        dp = me->query_skill("dodge", 1) / 2 +
             me->query_skill("pixie-jian", 1);

        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage": -damage ]);

                switch (random(4))
                {
                case 0:
                        result += (["msg" : HIR "$N" HIR "眼睛一花，$n" HIR "已没了踪"
                                            "影。突然$n" HIR "从身后拍了一下$N" HIR "的"
                                            "头，轻轻跃开。\n" NOR]);
                        break;
                case 1:
                        result += (["msg" : HIR "$N" HIR "眼前一花，似乎见到$n" HIR "身"
                                            "形一晃，但随即又见$n" HIR "回到原地，却似"
                                            "从未离开。\n" NOR]);
                        break;
                case 2:
                        result += (["msg" : HIR "$n" HIR "身形飘忽，有如鬼魅，转了几转"
                                            "，移步到$N" HIR "的身后，躲过了$N" HIR "这"
                                            "一招。\n" NOR]);
                        break;
                default:
                        result += (["msg" : HIR "突然间白影急晃，$n" HIR "向后滑出丈余"
                                            "，立时又回到了原地，躲过了$N" HIR "这一招"
                                            "。\n" NOR]);
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
                        result = HIY "突然间白影急晃，$n" HIY "向后滑出丈余，"
                                 "可是$N" HIY "不假思索，追身攻上，更是巧妙无"
                                 "方。\n" NOR;
                        break;
                }
                COMBAT_D->set_bhinfo(result);
        }
}

int query_effect_dodge(object attacker, object me)
{
        int lvl;

        lvl = me->query_skill("pixie-jian", 1);
        if (lvl < 50)  return 0;
        if (lvl < 100) return 30;
        if (lvl < 150) return 40;
        if (lvl < 200) return 60;
        if (lvl < 250) return 80;
        if (lvl < 300) return 100;
        if (lvl < 350) return 120;
        return 130;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        if (random(10) >= 5  && me->query("special_skill/guimai"))
        {
                if (random(3))
                {
                        victim->receive_wound("qi", damage_bonus / 4, me);
                        return HIR "只见" + victim->name() +
                               HIR "不寒而栗，身上数处地方渗出血丝！\n" NOR;
                }
                else
                {
                        victim->receive_wound("qi", damage_bonus / 3, me);
                        victim->receive_wound("jing", damage_bonus / 4, me);
                        return HIR "只见" + victim->name() +
                               HIR "神情恍惚，鲜血从身上数个穴位渗出！\n" NOR;
                }
        }
}

int practice_skill(object me)
{
        return notify_fail(HIC "辟邪剑法只能通过研习「辟邪剑谱」或「葵花"
                           "宝典」来学习。\n" NOR);
}
/*
int difficult_level()
{
        return 1200;
}
*/
//转世特技六阴鬼脉降低研究难度 by 薪有所属
int difficult_level()
{
     object me; 
     int lv;
     me = this_player(); 
     lv = me->query_skill("pixie-jian", 1) - 180; 
     if (lv > 200) lv = 200; 
     
     if (! me->query("special_skill/guimai"))
        return 1400 - lv;
     else
        return 1200 - lv;

}
string perform_action_file(string action)
{
        return __DIR__"pixie-jian/perform/" + action;
}

string exert_function_file(string action)
{
        return __DIR__"pixie-jian/exert/" + action;
}
