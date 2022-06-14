/*  option.h

    Copyright (C) 1994-2000 Annihilator <annihilator@muds.net>

    This program is a part of ES2 mudlib. Permission is granted to use,
    modify, copy or distribute this program provided this copyright notice
    remains intact and subject to the restriction that this program MAY
    NOT be used in any way for monetary gain.

    Details of terms and conditions is available in the Copyright.ES2 file.
    If you don't receive this file along with this program, write to the
    primary author of ES2 mudlib: Annihilator <annihilator@muds.net>
*/
#include <ansi.h>

inherit CORE_CLEAN_UP;

private void create() { seteuid(getuid()); }

int main(object me, string arg)
{
    string term;
    mixed v;

    if (!arg)
    {
        mapping opt = me->query("option");
        string str = "你目前设定的使用者选项；\n";

        if (!mapp(opt) || !sizeof(opt))
            str += "    無。\n";
        else
            foreach (term, v in opt)
                str += sprintf("    %-20s：%O\n", term, v);
        write(str);
        return 1;
    }

    if (sscanf(arg, "%s %d", term, v) == 2 || sscanf(arg, "%s %s", term, v) == 2)
    {
        if (!v)
            me->delete ("option/" + term);
        else
            me->set("option/" + term, v);
    }
    else
        return notify_fail("指令格式：option <选项> <设定值>\n");

    write("Ok.\n");
    return 1;
}

int help()
{
    write(@TEXT
指令格式：option <选项> <设定值>

這個指令让你设定一些有关使用者界面的选项。其中设定值 0 皆為系統預设值。

选项：                說明：                                  设定值：
map_unfreeze          地图系統中取消凍結地图画面於視窗上方    (0:关, 1:開)
map_hidden            地图系統是否隐藏地图画面                (0:否, 1:是)
map_obj_hidden        地图系統中是否隐藏环境物品              (0:否, 1:是)
map_obj_icon_hidden   地图系統中是否隐藏即時的物品图示        (0:否, 1:是)
map_exits_hidden      地图系統中是否隐藏出口                  (0:否, 1:是)
map_long_hidden       地图系统中是否隐藏描述                  (0:否, 1:是)
map_block             地图系統中是否只显示障碍物              (0:否, 1:是)
map_build             地图系統中是否只显示建築物及建地        (0:否, 1:是)
map_through           地图系統中是否啟用穿牆模式(巫師專用)    (0:否, 1:是)
brief_room            是否简化房間的詳細敘述                  (0:否, 1:是)
brief_short           是否只显示物品及人物的中文名稱          (0:否, 1:是)
TEXT);
    return 1;
}
