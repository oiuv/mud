// smash.c 2-22-95
 
#include <ansi.h>

inherit F_CLEAN_UP;
 
int main(object me, string arg)
{
	object ob;
        int immortal;
        string msg;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

	if (! arg)
                return notify_fail("指令格式: smash <living>\n");

	ob = present(arg, environment(me));
	if (! ob || ! me->visible(ob))
        {
                ob = find_player(arg);
                if (! ob || wiz_level(ob) < 1 || ! me->visible(ob))
                        ob = find_living(arg);

                if (! ob || ! me->visible(ob))
                        ob = find_object(arg);

                if (! ob || ! ob->is_character() || ! me->visible(ob))
                        return notify_fail("找不到这个生物。\n");
        }

        if (! me->is_admin())
        {
                switch (SECURITY_D->query_site_privilege("smash"))
                {
                case "all":
                        break;

                case "npc":
                        if (playerp(ob))
                                return notify_fail("你不能对玩家施展法力。\n");
                        break;

                default:
                        return notify_fail("你不能使用该命令。\n");
                }
        }

        if (environment(ob) != environment(me))
        {
                message("vision", HIY "\n天空慢慢的暗了下来，忽然间天际一亮，一道闪电"
                                  "伴随滚滚雷声直落而下，正正劈中" + ob->name(1) + HIY
                                  "。\n\n" NOR, all_interactive());
                
                if (wizardp(ob))
                {
                        immortal = (int)ob->query("env/immortal");
                        ob->set("env/immortal", 0);
                }
        
                if (wiz_level(me) < wiz_level(ob))
                {
                        message_vision(HIM "\n$N" HIM "身上冒着缕缕青烟，"
                                       "却没有半点事情。\n\n" NOR,
                                       ob);
                        return 1;
                }
        
                ob->set_temp("die_reason", "被" + me->name(1) + "用雷劈死了");
        
                ob->receive_damage("qi", 1, me);
        	ob->die();
                if (ob && wizardp(ob))
                        ob->set("env/immortal", immortal);
                return 1;
        }

        msg = HIC "\n$N" HIC "伸手一招，只见一道" HIY "闪电" HIC
              "从天而降，击中了$n" HIC "！！！\n" NOR;
        if (me == ob)
        {
                msg = replace_string(msg, "$n", "$N");
                message_vision(msg, me);
        }
        else
                message_vision(msg, me, ob);

        if (! ob->is_character())
        {
                message_vision(HIM + ob->name() + HIM "从这个世界上消失了...\n\n"
                               NOR, me);
                destruct(ob);
                return 1;
        }

        if (wizardp(ob))
        {
                immortal = (int)ob->query("env/immortal");
                ob->set("env/immortal", 0);
        }

        if (wiz_level(me) < wiz_level(ob))
        {
                message_vision(HIM "\n$N" HIM "身上冒着缕缕青烟，"
                               "却没有半点事情。\n\n" NOR,
                               ob);
                return 1;
        }

        ob->set_temp("die_reason", "被雷劈死了");

        if (ob == me)
               ob->set_temp("die_reason", "活得不耐烦，用雷把自己劈死了");

        ob->receive_damage("qi", 1, me);
	ob->die();
        if (ob && wizardp(ob))
                ob->set("env/immortal", immortal);

	return 1;
}
 
int help(object me)
{
        write(@HELP
指令格式: smash <生物>
 
hehehehehe...........

该命令在可以被授权使用的信息包括：npc、all。
HELP );
        return 1;
}
