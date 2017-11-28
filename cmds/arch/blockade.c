// blockade.c

#include <login.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object *ob;
	string wiz_status, src, dst, playerid;
	object link_ob;
	int i;

	if( me != this_player(1) ) return 0;
	
	wiz_status = SECURITY_D->get_status(me);
	if( wiz_status != "(admin)" && wiz_status != "(arch)" )
		return notify_fail("只有 (arch) 以上的巫师才能封住时空\n");

	seteuid(getuid());
	LOGIN_D->set_madlock(1);
        message("system", "\n*** " + RANK_D->query_rank(me) + me->short(1) + "正在封锁时空. ***\n*** 空中发出咝咝的响声. 严酷的考验就要来临... ***\n", users());
        write("处理中：");

	ob = users();
	for(i=0; i<sizeof(ob); i++) {
		if( objectp(link_ob = ob[i]->query_temp("link_ob")) ) {
			if( (int)link_ob->save() && (int)ob[i]->save() ) {
				playerid = ob[i]->query("id");
				src = "/data/user/" + playerid[0..0] + "/" + playerid + ".o" ;
				dst = "data/keep/" + playerid ; 
				cp(src, dst);
			}
			else { 
				LOGIN_D->set_madlock(0);
				return notify_fail("时空封锁失败了！！\n");
			}
		}
	}

	write("成功的封住了时空。\n");

	return 1;
}

int help (object me)
{
        write(@HELP
指令格式: blockade
 
封锁住现在的时空……
 
HELP
);
        return 1;
}
 
