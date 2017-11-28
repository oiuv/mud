// recover.c

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
		return notify_fail("Ö»ÓĞ (arch) ÒÔÉÏµÄÎ×Ê¦²ÅÄÜ»Ö¸´±»·â×¡µÄÊ±¿Õ\n");

	seteuid(getuid());
	message("system", "\n*** " + RANK_D->query_rank(me) + me->short(1) + "ÕıÔÚ½«±»ËøÊ±¿Õ½â·â ***\n*** ÊÀ½çºÃÏóÕıÔÚÂıÂı»Ö¸´³ÉÒÔÇ°µÄÑù×Ó... ***\n", users());
        write("´¦ÀíÖĞ£º");

	ob = users();
	for(i=0; i<sizeof(ob); i++) {
		if( objectp(link_ob = ob[i]->query_temp("link_ob")) ) { 
			playerid = ob[i]->query("id");
			dst = "/data/user/" + playerid[0..0] + "/" + playerid + ".o" ;
			src = "data/keep/" + playerid ;

			cp(src, dst);
			rm(src);
			ob[i]->restore();
		}
//		else {
//			return notify_fail("Ê±¿Õ½â·âÊ§°ÜÁË£¡£¡£\n¡");
//		}
	}
	
	write("Ê±¿Õ½â·âÍê±Ï¡£\n");
	LOGIN_D->set_madlock(0);
        //wind try
	log_file("/static/RECOVER", sprintf("%s call recover ON %s.\n", this_player()->query("name"),ctime(time())));
	return 1;
}

int help (object me)
{
        write(@HELP
Ö¸Áî¸ñÊ½: recover
 
½â·â±»·â×¡µÄÊ±¿Õ¡£
 
HELP
);
        return 1;
}
 
