// wizlist.c

#include <ansi.h>
#include <getconfig.h>

inherit F_CLEAN_UP;

int last_strlen(string str);
string get_title(string wiz_lvl);

int main(object me, string arg)
{
	string *list;
        string rank;
        string desc;
        mapping r;
        int i, k;

	desc = NOR + LOCAL_MUD_NAME() + "目前的巫师有：\n";
        desc += HIW "─────────────────────────────────\n" NOR;
	list = SECURITY_D->query_wizlist();
        r = ([ ]);

	for(i = 0; i < sizeof(list); i++)
        {
                rank = SECURITY_D->get_status(list[i]);

                if (! stringp(r[rank]))
                        r += ([ rank : "  " + sprintf("%-10s", list[i]) ]);
                else
                {
                        if (last_strlen(r[rank]) > 42)
                                r[rank] += "\n               ";
                        r[rank] += sprintf("%-10s", list[i]);
                }
        }

        list = SECURITY_D->query_wiz_levels();
        for (i = 0, k = 0; i < sizeof(list); i++)
        {
                if (! stringp(r[list[i]]))
                        continue;

                if (k) { desc += HIY; k = 0; } else
                       { desc += HIC; k = 1; }
                desc += get_title(list[i]) + r[list[i]] + "\n";
        }

        desc += HIW "─────────────────────────────────\n" NOR;
	desc += NOR "\n";
        write(desc);
	return 1;
}

string get_title(string wiz_lvl)
{
        while (strlen(wiz_lvl) < 12)
                wiz_lvl += " ";
        return wiz_lvl + ":";
}

int last_strlen(string str)
{
        string *slist;

        slist = explode(str, "\n");
        return strlen(slist[sizeof(slist) - 1]);
}

int help(object me)
{
write(@HELP
指令格式 : wizlist

用途 : 列出目前所有的巫师名单。
HELP
     );
     return 1;
}

