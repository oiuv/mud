inherit SKILL;

string *dodge_msg = ({
        "$n一式「高山流水」，身子掣忽一转，$N只觉的眼前一花，失去了目标。\n",
        "$n一式「玄冥幽幽」，双脚点地，身子突然拔高了丈许，缓缓飘落在$N身后。\n",
        "$n一式「幽幽空行」，身行一晃，顿时无数条身影一下子出现在$N的面前。\n",
        "$n一式「皓月冥星」，身体急转，化为一道白光，虚幻不定的出现在$N的周围。\n",
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
        if ((int)me->query("qi") < 45)
                return notify_fail("你的体力太差了，不能练流影步法。\n");

        me->receive_damage("qi", 35);
        return 1;
}

