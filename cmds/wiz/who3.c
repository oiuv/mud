// who3.c

#include <ansi.h>
#include <getconfig.h>

inherit F_CLEAN_UP;

int main(object me, string str)
{
        object ob;
        object *ob_list, *wiz_ob;
        mapping dbase;
        string line;
        int i;
        int delta;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

        seteuid(getuid());

        ob_list = users();
        wiz_ob = filter_array(ob_list, (: wizardp :));
        ob_list -= wiz_ob;

        wiz_ob  = sort_array(wiz_ob, "sort_wizard");
        ob_list = sort_array(ob_list, "sort_user");
        ob_list = wiz_ob + ob_list;

        str = HIG" 玩家      悟性-后天 根骨-后天 身法-后天 膂力-后天 异常 容貌\n"NOR
              WHT"——————————————————————————————————\n"NOR;
        i = 0;
        foreach (ob in ob_list)
        {
                dbase = ob->query_entire_dbase();
	        delta = dbase["int"] + dbase["con"] +
		        dbase["str"] + dbase["dex"] - 80;
                line = sprintf(NOR"%-10s  "
                               HIR"%2d:"
                               HIR"%4d "
                               HIG"%4d:"
                               HIG"%4d "
                               HIY"%4d:"
                               HIY"%4d "
                               HIB"%4d:"
                               HIB"%4d "
	                       HIW"%4d "
                               HIM"%4d \n" NOR,
                               ob->name(1),
                               dbase["int"],
                               ob->query_int(),
                               dbase["con"],
                               ob->query_con(),
                               dbase["dex"],
                               ob->query_dex(),
                               dbase["str"],
                               ob->query_str(),
                               delta,
                               dbase["per"]);

                str += line;

                if (i++ >= 200) break;
        }
        str += WHT"——————————————————————————————————\n"NOR +
               sprintf("%s共有 %d 位使用者连线中。\n", LOCAL_MUD_NAME(), sizeof(ob_list));
        me->start_more(str);
        return 1;
}

int sort_wizard(object ob1, object ob2)
{
	return (int)SECURITY_D->get_wiz_level(ob2) -
               (int)SECURITY_D->get_wiz_level(ob1);
}

int sort_user(object ob1, object ob2)
{
        return ob2->query("mud_age") - ob1->query("mud_age");
}

int help(object me)
{
        write(@HELP
指令格式：who3

玩家信息查询列表3。
HELP );
        return 1;
}            
