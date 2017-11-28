// persuading.c

inherit SKILL;

string type() { return "knowledge"; }

void skill_improved(object me)
{}

int valid_learn(object me)
{
        return notify_fail("渡世济人要在实践中提高。\n");
}
