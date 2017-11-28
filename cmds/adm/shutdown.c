// shutdown.c

#include <net/daemons.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	object *user, link_ob;
	int i;

        if (! SECURITY_D->valid_grant(me, "(admin)"))
                return 0;
	
	message_system("游戏重新启动，请稍候再登录。");

	user = users();
	for (i = 0; i < sizeof(user); i++)
        {
		catch(user[i]->save());
                user[i]->set_temp("block_msg/all", 1);
		link_ob = user[i]->query_temp("link_ob");
		if (objectp(link_ob)) catch(link_ob->save());
	}

	if (find_object(DNS_MASTER))
                catch(DNS_MASTER->send_shutdown());

        if (find_object(DBASE_D))
                catch(DBASE_D->mud_shutdown());

	shutdown(0);
	return 1;
}

int help (object me)
{
        write(@HELP
指令格式: shutdown
 
强行重新起动游戏，并且不保存任何运行中的数据。
 
HELP );
        return 1;
}
