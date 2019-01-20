// who1.c

#include <ansi.h>
#include <getconfig.h>

inherit F_CLEAN_UP;

int main(object me, string str)
{
        object where, ob, *ob_list, *wiz_ob;
//      string stri;
        mapping dbase;
        string line;
        int i;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

        seteuid(getuid());

        ob_list = users();
        wiz_ob = filter_array(ob_list, (: wizardp :));
        ob_list -= wiz_ob;

        wiz_ob  = sort_array(wiz_ob, "sort_wizard");
        ob_list = sort_array(ob_list, "sort_user");
        ob_list = wiz_ob + ob_list;

        str = HIG "线  上  玩  家              精          气         神      内力       经验值  潜能\n" NOR
              WHT "—————————————————————————————————————————\n" NOR;
        i = 0;
        foreach (ob in ob_list)
        {
                dbase = ob->query_entire_dbase();
                where = environment(ob);

                line  = sprintf(WHT"%-22s:  "
                                RED"%-5d/%-5d "
                                YEL"%-5d/%-5d "
                                GRN"%-7d "
                                BLU"%-5d/%-5d "
                                MAG"%-7d  "
                                CYN"%-4d\n"NOR,
                                dbase["name"] + "(" + dbase["id"] + ")",
                                dbase["jing"], dbase["max_jing"],
                                dbase["qi"], dbase["max_qi"],
                                dbase["shen"],
                                dbase["neili"], dbase["max_neili"],
                                dbase["combat_exp"],
                                dbase["potential"] - dbase["learned_points"]);
                str += line;

                if (i++ >= 200) break;
        }

        str += WHT "—————————————————————————————————————————\n" NOR +
               sprintf("%s共有 %d 位使用者连线中。\n", LOCAL_MUD_NAME(), sizeof(ob_list));

        me->start_more(str);
        return 1;
}

int sort_user(object ob1, object ob2)
{
	return ob2->query("combat_exp") - ob1->query("combat_exp");
}

int sort_wizard(object ob1, object ob2)
{
	return (int)SECURITY_D->get_wiz_level(ob2) -
               (int)SECURITY_D->get_wiz_level(ob1);
}

int help(object me)
{
        write(@HELP
指令格式：who1

玩家信息查询列表1。
HELP );
        return 1;
}