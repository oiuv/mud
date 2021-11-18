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
#include <command.h>

inherit F_CLEAN_UP;

private void create() { seteuid(getuid()); }

int main(object me, string arg)
{
    string term;
    mixed v;

    if (!arg)
    {
        mapping opt = me->query("option");
        string str = "你目前設定的使用者選項；\n";

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
        if (term == "map_unfreeze")
        {
            if (environment(me)->is_area())
            {
                if (!v)
                {
                    me->set_temp("window/freeze", 1);
                    write(CLR + FREEZE(14, me->query_temp("window/height")));
                }
                else
                {
                    me->delete_temp("window/freeze");
                    write(SAVEC + FREEZE("", "") + RESTC);
                }
            }
            else
            {
                if (v)
                {
                    me->delete_temp("window/freeze");
                    write(SAVEC + FREEZE("", "") + RESTC);
                }
            }
        }
    }
    else
        return notify_fail("指令格式：option <選項> <設定值>\n");

    write("Ok.\n");
    return 1;
}

int help()
{
    write(@TEXT
指令格式：option <選項> <設定值>

這個指令讓你設定一些有關使用者介面的選項。其中設定值 0 皆為系統預設值。

選項：                說明：                                  設定值：
map_unfreeze          地圖系統中取消凍結地圖畫面於視窗上方    (0:關, 1:開)
map_hidden            地圖系統是否隱藏地圖畫面                (0:否, 1:是)
map_obj_hidden        地圖系統中是否隱藏環境物品              (0:否, 1:是)
map_obj_icon_hidden   地圖系統中是否隱藏即時的物品圖示        (0:否, 1:是)
map_exits_hidden      地圖系統中是否隱藏出口                  (0:否, 1:是)
map_block             地圖系統中是否只顯示障礙物              (0:否, 1:是)
map_build             地圖系統中是否只顯示建築物及建地        (0:否, 1:是)
map_through           地圖系統中是否啟用穿牆模式(巫師專用)    (0:否, 1:是)
brief_room            是否簡化房間的詳細敘述                  (0:否, 1:是)
brief_short           是否只顯示物品及人物的中文名稱          (0:否, 1:是)
TEXT);
    return 1;
}
