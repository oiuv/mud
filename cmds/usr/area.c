/* map.c */

#include <command.h>
#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
    string file, text;
    object area;

    if (!(area = environment(me)))
        return 0;
    if (!area->is_area())
        return notify_fail("這個指令只適用在區域環境中。\n");

    // 區域大，分成左、右二部分的圖
    if (area->query("x_axis_size") > 49)
    {
        if (me->query("area_info/x_axis") <= 49)
            file = file_name(area) + "_left.ansi";
        else
            file = file_name(area) + "_right.ansi";
    }
    else
        file = file_name(area) + ".ansi";

    if (file_size(file) <= 0)
        return notify_fail("目前這個區域沒有地圖檔。\n");

    if (!(text = read_file(file)))
        text = "";

    me->start_more(text);

    return 1;
}

int help(object me)
{
    write(@HELP
指令格式： area

這個指令可以讓你查看區域環境的全圖，只適用在區域環境中，一般
房間環境無法使用。
HELP);
    return 1;
}
