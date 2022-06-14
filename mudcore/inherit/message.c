/*****************************************************************************
Copyright: 2019, Mud.Ren
File name: message.c
Description: 玩家角色信息显示控制接口
Author: xuefeng
Version: v1.0
Date: 2019-03-14
*****************************************************************************/
#include <ansi.h>

void receive_message(string type, string str)
{
    // debug_message(sprintf("receive_message %s %s", type, str));
    switch (type)
    {
    case "info":
        receive(HIC + str + NOR "\n");
        return;
    case "success":
        receive(HIG + str + NOR "\n");
        return;
    case "warning":
        receive(HIY + str + NOR "\n");
        return;
    case "danger":
        receive(HIR + str + NOR "\n");
        return;
    case "HIM":
        receive(HIM + str + NOR "\n");
        return;
    case "MAG":
        receive(MAG + str + NOR "\n");
        return;
    case "CYN":
        receive(CYN + str + NOR "\n");
        return;
    case "RED":
        receive(RED + str + NOR "\n");
        return;
    case "GRN":
        receive(GRN + str + NOR "\n");
        return;
    case "BLU":
        receive(BLU + str + NOR "\n");
        return;
    case "YEL":
        receive(YEL + str + NOR "\n");
        return;
    // 地图不加换行
    case "MAP":
        receive(str);
        return;

    default:
        receive(str + "\n");
    }
}

void receive_snoop(string message)
{
    receive(BBLU + remove_ansi(message) + NOR);
}

void write_prompt()
{
    // 显示玩家提示,由MUD自己实现
}

void finish_input()
{
    // 显示暂存信息,由MUD自己实现
}

/**
 * 消息分页显示接口
 */
#include <runtime_config.h>

#define LINE_NUMBER 1
#ifndef LINES_PER_PAGE
#define LINES_PER_PAGE 30
#endif

private void step_more(string *msg, int line, int size, int height, string cmd)
{
    int _height = height;
    string bar;
    object me = this_player();

    sscanf(cmd, "%d", line);
    switch (cmd)
    {
    case "b":
        tell_object(me, ansi(implode(msg[(line -= _height * 2 > line ? line : _height * 2)..(line += _height) - 1], "\n")) + "\n");
        break;
    case "q":
        tell_object(me, "\n");
        finish_input();
        return;
    default:
        if (size > _height)
            tell_object(me, "\n" + ansi(implode(msg[line..(line += _height) - 1], "\n")) + "\n");
        else
            tell_object(me, "\n" + ansi(implode(msg[line..], "\n")) + "\n");
        break;
    }

    if (line >= size || line < LINES_PER_PAGE)
    {
        finish_input();
        return;
    }
    bar = sprintf(
        NOR WHT "── 信息末完 " HIG "%3d" HIW "/" NOR GRN "%-3d" HIW "(%2d%%)" NOR WHT " ── " HIW "<ENTER>" NOR WHT "下一页，" HIW "B" NOR WHT " 上一页，" HIW "<数字>" NOR WHT " 移至行，" HIW "Q" NOR WHT " 离开 ──" NOR,
        line,
        size,
        line * 100 / size);

    tell_object(me, bar);

    input_to((: step_more, msg, line, size, height :));
}

private void more_process(string *msg, int start_line, int flag)
{
    int num, blanks, height, size;

    height = LINES_PER_PAGE;

    size = sizeof(msg);

    blanks = sizeof(size + "");

    if (flag & LINE_NUMBER)
        for (num = 1; num <= size; num++)
            msg[num - 1] = sprintf(HIW "%-" + blanks + "d- " NOR "%s", num, msg[num - 1]);

    step_more(msg, start_line, size, height, "");
}

varargs nomask void more(string arg, int flag)
{
    string *msg;

    if (!arg || arg == "")
        return;

    msg = explode(arg, "\n");

    if (arg[0] == '\n')
        msg = ({""}) + msg;

    more_process(msg, 0, flag);
}

nomask varargs void more_file(string file, int start_line, int flag, string extra)
{
    int bytes = 0, fsize, max_byte_transfer;
    string str = "", *msg;

    if (!file || file == "")
        return;

    fsize = file_size(file);

    if (fsize <= 0)
        return;

    max_byte_transfer = get_config(__MAX_BYTE_TRANSFER__);

    do
    {
        str += read_bytes(file, bytes, max_byte_transfer);
        bytes += max_byte_transfer;
    } while (bytes < fsize);

    msg = explode(str, "\n");

    if (!undefinedp(extra))
        msg += ({extra});

    more_process(msg, start_line, flag);
}
