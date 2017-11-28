#include <ansi.h>
#include <getconfig.h>

inherit  F_CLEAN_UP;

mixed  main(object  me,  string  arg,  int  remote)
{
	object  *ulist;
	int  i;

       if (! SECURITY_D->valid_grant(me, "(wizard)"))
              return 0;

	ulist  =  users();
	i  =  sizeof(ulist);
	while  (i--)  {
		object  who  =  ulist[i];
		object  ridee  =  ulist[i]->query_temp("is_riding");
		
		if  (!  ridee)
			continue;
		if  (ridee->query_temp("is_rided_by")  !=  who)  {
			continue;
		}	
		write  ("    ");
		write  (who->query("name")+"("+who->query("id")+")");
		//write  (ridee->query("ride/msg")+"在");
		write  ("骑在");
		write  (ridee->query("name")+"("+ridee->query("id")+")");
		write  ("上。\n");
	}
	return  1;
}

int  help  (object  me)
{
                write(@HELP
指令格式  :  whoride  
  
可列出目前骑有坐骑的玩家。
  
  
HELP
);
                return  1;
}
