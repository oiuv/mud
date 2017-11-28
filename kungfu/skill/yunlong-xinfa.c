// yunlong-xinfa.c 云龙心法

inherit SKILL;

void create() { seteuid(getuid()); }

string type() { return "knowledge"; }

int practice_skill(object me)
{	
	return notify_fail("云龙心法只能靠学(learn)来提高。\n");
}
