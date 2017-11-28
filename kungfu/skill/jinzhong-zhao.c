// jingang-buhuaiti.c
// Created by Doing

#include <ansi.h>

inherit SKILL;

int valid_enable(string usage) { return usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("force") < 350)
                return notify_fail("你的内功火候不够，难以修习这等神功。\n");
                
        if (me->query("con") < 33)
                return notify_fail("你的先天根骨太差了，难以修习这等神功。\n");        

        if (me->query("str") < 33)
                return notify_fail("你的先天臂力太差了，难以修习这等神功。\n");

        if ((int)me->query("max_neili") < 4000)
                return notify_fail("你的内力还不足以修习这等神功。\n");

        if ((int)me->query_skill("force", 1) < (int)me->query_skill("jinzhong-zhao", 1))
                return notify_fail("你的基本内功水平有限，无法领会更高深的金钟罩。\n");

        return 1;
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mapping result;
        //int ap, dp, mp;
        int ap, dp;
        int cost; 
        //string msg;

        if ((int)me->query_skill("jinzhong-zhao", 1) < 150 || (int)me->query("neili") < 400 || ob->query_temp("weapon") || ! living(me) || ! me->query_temp("jinzhongzhao"))
                return;

        cost = damage / 2;
        if (cost > 100) cost = 100;

        //mp = ob->query_skill("count", 1);
        ap = ob->query_skill("force") * 12 + ob->query("max_neili");
        dp = me->query_skill("force") * 12 + me->query("neili");

        if (dp / 2 + random(dp) > ap)
        {
                me->add("neili", -cost);
                result = ([ "damage": -damage ]);

                switch (random(5))
                {
                case 0:
                        result += (["msg" : HIG "$n" HIG "不退反进，一股无形气流直把$N"
                                            HIG "副得难以招架，连连退后。\n" NOR]);
                        break;
                case 1:
                        result += (["msg" : HIY "只见$N" HIY "移至$n身后，猛然一招朝$n"
                                            HIY "的后心拍去，但不料反被震退数步。\n" NOR]);
                        break;
                case 2:
                        result += (["msg" : HIW "$N" HIW "冲破$n的无形真气，接着全力一掌拍在$n" HIW "身上，可"
                                            "万万无料到另一股气墙直撞\n而出，将$N的攻击硬生生地弹开。\n" NOR]);
                        break;
                case 3:
                        result += (["msg" : HIC "$N" HIC "一招拍在$n" HIC "身上，可见$n"
                                            HIC "不闪不避，只是全身迅猛一抖，$N" HIC "的力道反被护体罡气震退了"
                                            "开来。\n" NOR]);
                        break;
                default:
                        result += (["msg" : MAG "$n" MAG "见$N来势凶凶攻来，不由嘴角轻轻一笑，飞身一跃"
                                            MAG "直往$N的力道撞去，竟把\n$N震个人仰马翻，狼狈不堪!\n" NOR]);
                        break;
                }
                return result;
        } 

}

int query_effect_parry(object attacker, object me)
{
        int lvl;

        lvl = me->query_skill("jinzhong-zhao", 1);
        if (lvl < 100) return 0;
        if (lvl < 150) return 20;
        if (lvl < 200) return 30;
        if (lvl < 250) return 40;
        if (lvl < 300) return 50;
        if (lvl < 350) return 60;
        if (lvl < 400) return 80;
        if (lvl < 480) return 90;
        if (lvl < 500) return 100;
        return 120;
}

int practice_skill(object me)
{
        if (me->query_skill("jinzhong-zhao", 1) < 100)
                return notify_fail("你对这门护体神功的了解甚浅，还不足以自行锻炼。\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("jing") < 100)
                return notify_fail("你的体力太低了。\n");


        if ((int)me->query("neili") < 120)
                return notify_fail("你的内力不够练金钟罩。\n");

        me->receive_damage("jing", 100);
        me->add("neili", -100);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"jinzhong-zhao/" + action;
}

