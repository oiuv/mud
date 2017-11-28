// chuanyun-bu 穿云步法


inherit SKILL;

string *dodge_msg = ({
    "$n一式「追风逐电」，身子掣忽一转，$N只觉的眼前一花，失去了目标。\n",
    "$n一式「左右穿花」，双脚点地，身子突然拔高了丈许，缓缓飘落在$N身后。\n",
    "$n一式「登云步月」，身行一晃，顿时无数条身影一下子出现在$N的面前。\n",
    "$n一式「无影无踪」，飘然向后一退，躲开$N的凌厉攻势。\n",
    "$n一式「划地为牢」，身体急转，化为一道白光，虚幻不定的出现在$N的周围。\n",
});

int valid_enable(string usage)
{
        return usage == "dodge" || usage == "move";
}

int valid_learn(object me)
{
        return 1;
}

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
        if( (int)me->query("qi") < 50 )
                return notify_fail("你的体力太差了，不能练穿云步法。\n");

        me->receive_damage("qi", 40);
                return 1;
}

