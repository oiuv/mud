// grant.c

#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        int opt_clear, opt_del;
        int i;
        string *opts, *gr;                
        string user;
        object ob;
        string msg;

        if (! is_root(me) && ! SECURITY_D->valid_grant(me, "(admin)"))
                return notify_fail("只有管理员才能使用授权命令。\n");

        if (! me->is_admin())
        {
                switch (SECURITY_D->query_site_privilege("grant"))
                {
                case "enable":
                        break;

                default:
                        return notify_fail("你不能为其他玩家授权。\n");
                }
        }

        if (! arg)
        {
                gr = SECURITY_D->query_grant_users();
                if (! arrayp(gr) || sizeof(gr) < 1)
                {
                        write("目前系统中没有人被授予额外使用命令的权利。\n");
                        return 1;
                }

                msg = "目前系统中被授与可以额外使用命令的用户有：\n";
                msg += implode(gr, "、") + "。\n";
                write(msg);
                return 1;
        }

        arg = replace_string(arg, ";", " ");
        arg = replace_string(arg, ",", " ");
        opts = explode(arg, " ");
        for (i = 0; i < sizeof(opts); i++)
        {
                if (opts[i] == "")
                        continue;

                if (opts[i] == "-c") opt_clear = 1; else
                if (opts[i] == "-d") opt_del   = 1; else
                if (! stringp(user)) user = opts[i]; else
                if (file_size("/grant/" + opts[i]) < 0)
                        return notify_fail("请参见/grant下面的"
                                           "可授权命令，目前并没有 " + opts[i] +
                                           " 这个项目。\n");
                else continue;

                opts[i] = 0;
        }

        opts -= ({ 0, "" });
        if (! stringp(user))
                return notify_fail("你要给谁授权？\n");

        ob = find_player(user);

        if (opt_clear)
        {
                // 清除某一个玩家所有的权限
                write("清除了 " + user + " 的所有授予的命令使用权限。\n");
                if (SECURITY_D->remove_grant(user, "*") && objectp(ob))
                        tell_object(ob, HIG + me->name(1) + "收回了所有授予你的命令使用权限。\n");
                return 1;
        }

        if (! sizeof(opts))
        {
                // 显示一个玩家所有的权限
                gr = SECURITY_D->query_grant(user);
                if (! arrayp(gr) || sizeof(gr) < 1)
                {
                        write("目前 " + user + " 并没有被授予任何命令使用权限。\n");
                        return 1;
                }

                msg = "目前 " + user + " 授予的命令使用权限有：\n";
                for (i = 0; i < sizeof(gr); i++)
                {
                        msg += WHT + gr[i] + NOR;
                        if (i < sizeof(gr) - 1)
                        {
                                msg += "、";
                                if ((i + 1) % 8 == 0) msg += "\n";
                        }
                }
                msg += "。\n";
                write(msg);
                return 1; 
        }

        for (i = 0; i < sizeof(opts); i++)
        {
                if (opt_del)
                {
                        if (! me->is_admin())
                                message_system(me->name(1) + "收回了 " + user +
                                               " 使用 " + opts[i] + " 的权限。\n");
                        write("清除了 " + user + " 使用 " + opts[i] +
                              " 的权限。\n");
                        if (SECURITY_D->remove_grant(user, opts[i]) && objectp(ob))
                                tell_object(ob, HIG + me->name(1) +
                                            "收回了你 " + opts[i] +
                                            " 的权限。\n");
                } else
                {
                        if (! me->is_admin())
                                message_system(me->name(1) + "授予 " + user +
                                               " 使用 " + opts[i] + " 的权限。\n");
                        write("授予了 " + user + " 使用 " + opts[i] +
                              " 的权限。\n");
                        if (SECURITY_D->grant(user, opts[i]) && objectp(ob))
                                tell_object(ob, HIG + me->name(1) +
                                            "授予了你 " + opts[i] +
                                            " 的权限。\n");
                }
        }

        // 保存授权信息
        SECURITY_D->save();

	return 1;
}

int help (object me)
{
        write(@HELP
指令格式: grant [-d | -c] <玩家> <命令> <命令> ....

给一个玩家授权使用某些命令。当然，该玩家必须能够呼叫到这些命
令才可以，另外并不是所有的命令都可以授权的，具体可以参见目录
/grant下面的文件。

使用 -d 参数可以去掉一个玩家对某些命令的使用权限，使用 -c 参
数则可以清除一个玩家所有已经授予的使用权限。

如果除了<玩家>以外不加任何命令参数和选项参数，则显示该玩家目
前的授权状况。

如果没有任何参数，则现实当前系统中被授权过的使用者。你可以查
询 /grant 目录下的文件了解有那些命令可以通过授权使用。注意：
授权只是让该使用者可以使用该命令，但是究竟能否使用还要看该命
令所在的位置。

该命令可以授权的信息：enable

HELP );
        return 1;
}
