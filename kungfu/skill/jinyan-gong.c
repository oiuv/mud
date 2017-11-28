inherit SKILL;

string *dodge_msg = ({
        "$n足尖在地面一点，身形拔地而起，躲开了这一招。\n",
        "却不料$n身形一转，突然转到了$N的身后。\n",
        "$n随着$N攻来的招式飘了起来，就如一片微风中的柳絮一般。\n",
        "$n身形左一晃、右一闪，不知怎么的，从攻击的间隙中钻了出来。\n",
        "$n足不点地地围绕$N连绕三个大圈，把$N这一招避了开去。\n",
        "$n连旋数个大圈，跟着又是一个大圈，身形高高地拔了起来。\n",
});

int valid_enable(string usage)
{
        return usage == "dodge" || usage == "move";
}

int valid_learn(object me)
{
        if ((int)me->query_skill("dodge", 1) < 50)
                return notify_fail("你基本轻功修为有限，难以修炼金雁功。\n");

        if (me->query("max_neili") < 500)
                return notify_fail("你内力修为太浅，难以修炼金雁功。\n");
        return 1;
}

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int query_effect_dodge(object attacker, object me)
{
        int lvl;

        lvl = me->query_skill("jinyan-gong", 1);
        if (lvl < 30)  return 0;
        if (lvl < 50)  return 10;
        if (lvl < 100) return 20;
        if (lvl < 150) return 30;
        if (lvl < 200) return 40;
        return 50;
}


int practice_skill(object me)
{
        if( (int)me->query("qi") < 70 )
                return notify_fail("你的体力太差了，不能练金雁功。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力太差了，不能练金雁功。\n");

        me->receive_damage("qi", 58);
        me->add("neili", -55);
        return 1;
}