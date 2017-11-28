// 罗汉伏魔神功 luohan-fumogong.c
// Editd By Vin On 29/5/2002

#include <ansi.h>
inherit FORCE;

int valid_force(string force)
{
        return 1;
}

int query_neili_improve(object me)
{
        int lvl;
        string fam;

        fam = me->query("family/family_name");
        lvl = (int)me->query_skill("luohan-fumogong", 1);

        // 喝过玄冰碧火酒并且门派为少林
        if (me->query("skybook/item/xuanbingjiu")
           && fam == "少林派"
           && me->query("class") == "bonze")
                return lvl * lvl * 15 * 18 / 100 / 200;
        else

        // 没喝过玄冰碧火酒但门派为少林
        if (me->query("class") == "bonze"
           && fam == "少林派")
                return lvl * lvl * 15 * 15 / 100 / 200;
        else

        // 喝过玄冰碧火的其他门派玩家
        if (me->query("skybook/item/xuanbingjiu"))
                return lvl * lvl * 15 * 12 / 100 / 200;
        else
        // 普通情况
                return lvl * lvl * 15 * 4 / 100 / 200;
}

int valid_enable(string usage)
{ 
        return usage == "force";       
}

int valid_learn(object me)
{
        if (me->query("character") == "心狠手辣")
                return notify_fail("你心中暗道：此功一点气势也无，何苦费力学它。。\n");

        if (me->query("character") == "阴险奸诈")
                return notify_fail("你心中暗道：此功平淡无奇，何苦为它花费心思。\n");

        if ((int)me->query("int") < 30)
                return notify_fail("你先天悟性不足，难以领会罗汉伏魔神功。\n");

        if ((int)me->query("con") < 30)
                return notify_fail("你先天根骨孱弱，无法修炼罗汉伏魔神功。\n");

        if ( me->query("gender") == "无性" && me->query("luohan-fumogong", 1) > 29)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的罗汉伏魔神功。\n");

        if ((int)me->query_skill("force", 1) < 100)
                return notify_fail("你的基本内功火候不足，不能学罗汉伏魔神功。\n");

        if ((int)me->query("max_neili", 1) < 1000)
                return notify_fail("你的内力修为不足，不能学罗汉伏魔神功。\n");

        return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("罗汉伏魔神功只能用学(learn)的来增加熟练度。\n");
}

int difficult_level(object me)
{
        string fam;
    
        me = this_player();

        fam = me->query("family/family_name");

        if (me->query("skybook/item/xuanbingjiu")
           && fam == "少林派"
           && me->query("class") == "bonze")
                return 200;
        else

        if (me->query("class") == "bonze"
           && fam == "少林派")
                return 400;
        else

        if (me->query("skybook/item/xuanbingjiu"))
                return 600;
        else
                return 800;
}

string exert_function_file(string action)
{
        return __DIR__"luohan-fumogong/" + action;
}
