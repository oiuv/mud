// wear.c

#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

int do_wear(object me, object ob);

int main(object me, string arg)
{
	object ob, *inv;
	int i, count;

	if (! arg) return notify_fail("你要穿戴什么？\n");

	if (arg == "all")
        {
		inv = all_inventory(me);
		for(count = 0, i = 0; i < sizeof(inv); i++)
                {
			if (inv[i]->query("equipped")) continue;
			if (do_wear(me, inv[i])) count++;
		}
                if (! count)
                        write("你什么都没有穿上。\n");
                else
		        write("你穿好了。\n");
		return 1;
	}

	if (! objectp(ob = present(arg, me)))
		return notify_fail("你身上没有这样东西。\n");

	if (ob->query("equipped"))
        {
		inv = all_inventory(me) - ({ ob });
		for(count = 0, i = 0; i < sizeof(inv); i++)
                {
			if (! inv[i]->id(arg)) continue;
			if (inv[i]->query("equipped")) continue;
			if (do_wear(me, inv[i]))
                        {
				count++;
				break;
			}
		}
		if (! count)
			return notify_fail("你已经装备著了。\n");

		return 1;
	}

	return do_wear(me, ob);
}

int do_wear(object me, object ob)
{
	string str;
        //mapping p;
        mixed notice;

        if (notice = ob->query_temp("no_wear"))
        {
                if (stringp(notice)) write(notice);
                return notify_fail("还是试试别的吧！\n");
        }

	if (ob->query("female_only") &&
	    (string)me->query("gender") =="男性")
		return notify_fail("这是女人的衣衫，你一个大男人也想穿，羞也不羞？\n");

	if (ob->wear())
        {
		if (! stringp(str = ob->query("wear_msg")))
			switch (ob->query("armor_type"))
                        {
				case "cloth":
				case "armor":
				case "boots":
					str = YEL "$N穿上一" + ob->query("unit") + "$n" YEL "。\n" NOR;
					break;
				case "head":
				case "neck":
				case "wrists":
				case "hands":
					str = YEL "$N戴上一" + ob->query("unit") + "$n" YEL "。\n" NOR;
					break;
				case "waist":
					str = YEL "$N将一" + ob->query("unit") + "$n" YEL "绑在腰间。\n" NOR;
					break;
				default:
					str = YEL "$N装备$n" YEL "。\n" NOR;
			}
                if (ob->query_temp("daub") &&
                    ob->query("armor_type") != "hands")
                        DAUB_CMD->check_poison(me, ob);

		message_vision(str, me, ob);
		return 1;
	} else
		return 0;
}

int help(object me)
{
	write(@HELP
指令格式：wear <装备名称>
 
这个指令让你装备某件防具。
 
HELP );
        return 1;
}
