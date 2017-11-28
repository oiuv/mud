// sp.c

#include <ansi.h>
#include <mudlib.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        mapping site_privilege;
        string item, desc;
        string msg;

        if (! is_root(me) && ! SECURITY_D->valid_grant(me, "(admin)"))
                return notify_fail("只有管理员才能授权该站点的使用权限。\n");

        if (! arg)
        {
                site_privilege = SECURITY_D->query_site_privilege();
                map_delete(site_privilege, INTERMUD_MUD_NAME);
                if (sizeof(site_privilege) < 1)
                {
                        write("目前该站点没有赋予任何使用权限。\n");
                        return 1;
                }

                msg = "目前该站点(" + INTERMUD_MUD_NAME + ")赋予的使用权限信息如下：\n";

                foreach (item in keys(site_privilege))
                        msg += sprintf("%s : %s\n", item, site_privilege[item]);

                me->start_more(msg);
                return 1;
        }

        if (! me->is_admin())
                return notify_fail("你不能修改这个站点的使用权限。\n");

        if (sscanf(arg, "%s %s", item, desc) != 2)
        {
                item = arg;
                desc = 0;
        }

        if (desc == "0" || desc == "clear")
                desc = 0;

        if (! SECURITY_D->set_site_privilege(item, desc))
                return notify_fail("无法设置 " + item +
                                   " 方面的权限信息为 " + desc + "。\n");
        else
        if (! desc)
                write("清除了 " + item + " 方面的权限信息。\n");
        else
                write("Ok.\n");

        SECURITY_D->save();
	return 1;
}

int help (object me)
{
        write(@HELP
指令格式: sp <class> <info>

授权给本地站点某些方面的使用权限。info 如果为空或是 clear 则
表示取消这类的使用权限。
HELP );
        return 1;
}
