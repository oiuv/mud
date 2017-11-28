// ban.c
// Created by Xiang@XKX
// updated by doing

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	string site;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

	if (! arg)
        {
		BAN_D->print();
                return 1;
        }

	if (sscanf(arg, "+ %s", site) == 1)
        {
                if (sscanf(site, "%*d.%*d.%*d.%*d") != 4 &&
                    sscanf(site, "%*d.%*d.%*d.*") != 3)
                {
                        write("你只能禁止一个IP地址或是一个C类网段(?.?.?.*)地址。\n");
                        return 1;
                }

		BAN_D->add_site(site);
                write("Ok.\n");
	} else
        if (sscanf(arg, "- %s", site) == 1)
		BAN_D->remove_site(site);
	else
                write("指令格式：ban [+|- site]\n");

	return 1;
	
}

int help(object me)
{
	write(@HELP
指令格式：ban [+|- site]

这条命令是用来防止有人蓄意捣乱。可以输入ban + ??.??.??.*来禁
止一个C类网段地址。
HELP );
	return 1;
}
