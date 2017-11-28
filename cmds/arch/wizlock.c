// wizlock.c

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	int lvl;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

	if (! arg || arg == "")
		return notify_fail("指令格式：wizlock <巫师等级>\n");

	if (sscanf(arg, "%d", lvl) != 1) lvl = wiz_level(arg);
	seteuid(getuid());

	if (LOGIN_D->set_wizlock(lvl))
        {
		write("Ok.\n");
		return 1;
	} else
		return notify_fail("上线权限设定失败。\n");
}

int help (object me)
{
        write(@HELP
指令格式: wizlock <巫师等级>
 
限制某个等级以下的使用者进入游戏。
其中巫师等级分别为 (immortal) (wizard) (arch) (admin), 若要取
消限制, 则输入 (player).
 
HELP );
        return 1;
}
