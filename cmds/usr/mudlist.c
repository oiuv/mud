// mudlist.c

#include <ansi.h>
#include <net/daemons.h>
#include <net/macros.h>
#include <net/dns.h>
#include <mudlib.h>
#include <getconfig.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	mapping mud_list;
	mapping mud_svc;
	mixed *muds;
	string output;
        string name;
        string mudn;
        string vis_mudn;
	int loop, size;
        string local_mudlib;
        int uc;

	if (! find_object(DNS_MASTER))
		return notify_fail("网络精灵并没有被载入，请先将网路精灵载入。\n");

	//	Obtain mapping containing mud data
	mud_list = (mapping)DNS_MASTER->query_muds();

	// so we recognise ourselves as a DNS mud
	mud_svc = DNS_MASTER->query_svc() + ([ Mud_name() : 0 ]);

	if (! mud_list)
		return notify_fail(LOCAL_MUD_NAME() + "目前并没有跟网路上其他 Mud 取得联系。\n");

	// Get list of all mud names within name server
	muds = keys(mud_list) - ({ "DEFAULT" });

        if (! arg)
        {
                // filter for release sub sites & me
                local_mudlib = MUDLIB_NAME;
                muds = filter_array(muds, (: $(mud_list)[$1]["MUDLIB"] == $(local_mudlib) &&
                                             (! VERSION_D->is_release_server() ||
                                              $1 == INTERMUD_MUD_NAME ||
                                              CONFIG_D->query($(mud_list)[$1]["HOSTADDRESS"]) == "valid") :));
        } else
        if (arg == "sites")
        {
                // filter for all sub sites & me
                local_mudlib = MUDLIB_NAME;
                muds = filter_array(muds, (: $(mud_list)[$1]["MUDLIB"] == $(local_mudlib) &&
                                             (! VERSION_D->is_release_server() ||
                                              $1 == INTERMUD_MUD_NAME ||
                                              CONFIG_D->query($(mud_list)[$1]["HOSTADDRESS"])) :));
        } else
        if (arg != "all")
                // filter for muds matched argument
                muds = filter_array(muds, (: sscanf($1, $(arg) + "%*s") :));

        if (! sizeof(muds))
                return notify_fail("目前本站并没有和这个 MUD 取得任何联系。\n");

	//	Place mudlist into alphabetical format
	muds = sort_array(muds, 1);

	output = WHT BBLU " Mud          中文名称            国际网路位址     端口  人数 \n" NOR
                 "───────────────────────────────\n";

        //      Count for users
        uc = 0;

	//	Loop through mud list and store one by one
	for (loop = 0, size = sizeof(muds); loop < size; loop++)
        {
                mudn = muds[loop];
                if (undefinedp(mud_list[mudn]["USERS"]))
                        continue;

                if (! stringp(name = mud_list[mudn]["MUDNAME"]))
                        name = "未知名称";

		// filter some ... strange ansi
		name = replace_string(name, ESC "[0;37;0m", "");
		name = replace_string(name, ESC "[2;17m", "");
                name = filter_color(name);

                // 修正长度
                vis_mudn = filter_color(mudn);
                if (strlen(vis_mudn) > 12) vis_mudn = vis_mudn[0..11];
                if (strlen(name) > 20) name = name[0..19];

                if (mudn == mud_nname())
                        output += HIY BRED;

                if (stringp(mud_list[mudn]["ZONE"]))
                        name += "(" + mud_list[mudn]["ZONE"] + ")";

		output += sprintf(" %-13s%-20s%-17s%-6s%-4s \n" NOR,
				  upper_case(vis_mudn), name,
			          mud_list[mudn]["HOSTADDRESS"],
			          mud_list[mudn]["PORT"],
                                  mud_list[mudn][DNS_NO_CONTACT] > MAX_RETRYS ? "失去联系"
                                                                              : mud_list[mudn]["USERS"]);

                // 累计玩家数量
                if (mud_list[mudn][DNS_NO_CONTACT] <= MAX_RETRYS)
                        uc += atoi(mud_list[mudn]["USERS"]);
        }
        output += "───────────────────────────────\n";

        if (! arg || arg == "sites")
                output += "本泥潭共有 " CYN + uc + NOR " 位玩家在游戏中。\n";

        if (objectp(me))
	        me->start_more(output);
        else
                write(output + "\n");

	return 1;
}

int help()
{
	write(@HELP
指令格式 : mudlist <MUD名字> | all | sites

这个指令让你列出目前跟这个 Mud 取得联系中的其他 Mud。

如果不加参数则列出该 Mud 所有正式分站。
使用 all 参数表示列出所有的 Mud 游戏。
使用 sites 参数表示列出该 Mud 的所有分站。
如果不是以上参数，则列出以 <MUD名字> 开头的站点。
HELP );
	return 1;
}
