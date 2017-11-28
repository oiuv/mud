// poison.c 基本毒技
// Modified by Java Mar.1998
inherit SKILL;

void create() { seteuid(getuid()); }
string type() { return "poison"; }

int valid_learn(object me)
{
        if (me->query("character") == "光明磊落")
                return notify_fail("你心中暗想：我行事光明磊落，学什么毒技！\n");

        return 1;
}
