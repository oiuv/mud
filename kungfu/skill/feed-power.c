// feed-power.c

inherit SKILL;

string type() { return "knowledge"; }

void skill_improved(object me)
{
}

int valid_learn(object me)
{
        if (me->query_skill("feed-power", 1) < 500)
                return 1;

        return 0;
}

