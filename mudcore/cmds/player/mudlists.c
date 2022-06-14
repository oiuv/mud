// mudlist.c
#include <ansi.h>
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    mapping mud_list;
    mixed *muds;
    string output;
    string name;
    string mudn;
    string vis_mudn;
    int loop, size;
    //    Obtain mapping containing mud data
    mud_list = (mapping)INTERMUD_D->query_mudlist();

    if (!mud_list)
        return notify_fail("目前并没有跟网路上其他 Mud 取得联系。\n");
    // debug_message(sprintf("%O", mud_list));

    //    Place mudlist into alphabetical format
    muds = sort_array(keys(mud_list), 1);
    // debug_message(sprintf("%O", muds));
    output = WHT BBLU " MUDLIB                   MUD名称                  国际网路位址        端口\n" NOR
                      "---------------------------------------------------------------------------\n";

    // Loop through mud list and store one by one
    for (loop = 0, size = sizeof(muds); loop < size; loop++)
    {
        mudn = muds[loop];
        if (undefinedp(mud_list[mudn]["USERS"]))
        {
            // continue;
            mud_list[mudn]["USERS"] = "未知";
        }

        if (!stringp(name = mud_list[mudn]["NAME"]))
            name = "未知名称";
        vis_mudn = mud_list[mudn]["MUDLIB"];

        if (stringp(mud_list[mudn]["ZONE"]))
            name += "(" + mud_list[mudn]["ZONE"] + ")";

        output += sprintf(" %-25s%-25s%-20s%-5s" NOR + "\n",
                          vis_mudn, name,
                          mud_list[mudn]["HOSTADDRESS"],
                          mud_list[mudn]["PORT"]);
    }
    output += "---------------------------------------------------------------------------\n";

    if (objectp(me))
        me->start_more(output);
    else
        write(output + "\n");

    return 1;
}

int help()
{
    write(@HELP
指令格式 : mudlists

这个指令让你列出目前跟这个 Mud 取得联系中的其他 Mud。
HELP );
    return 1;
}
