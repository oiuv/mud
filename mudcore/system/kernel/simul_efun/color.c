/*****************************************************************************
Copyright: 2019, Mud.Ren
File name: color.c
Description: ANSI颜色处理相关模拟函数
Author: xuefeng
Version: v1.0
Date: 2019-03-12
History:
*****************************************************************************/
#include <ansi.h>
// 清理ansi色彩
string remove_ansi(string arg)
{
    arg = replace_string(arg, BLK, "");
    arg = replace_string(arg, RED, "");
    arg = replace_string(arg, GRN, "");
    arg = replace_string(arg, YEL, "");
    arg = replace_string(arg, BLU, "");
    arg = replace_string(arg, MAG, "");
    arg = replace_string(arg, CYN, "");
    arg = replace_string(arg, WHT, "");
    arg = replace_string(arg, HIR, "");
    arg = replace_string(arg, HIG, "");
    arg = replace_string(arg, HIY, "");
    arg = replace_string(arg, HIB, "");
    arg = replace_string(arg, HIM, "");
    arg = replace_string(arg, HIC, "");
    arg = replace_string(arg, HIW, "");
    arg = replace_string(arg, NOR, "");
    arg = replace_string(arg, BOLD, "");
    arg = replace_string(arg, BLINK, "");
    arg = replace_string(arg, BBLK, "");
    arg = replace_string(arg, BRED, "");
    arg = replace_string(arg, BGRN, "");
    arg = replace_string(arg, BYEL, "");
    arg = replace_string(arg, BBLU, "");
    arg = replace_string(arg, BMAG, "");
    arg = replace_string(arg, BCYN, "");
    arg = replace_string(arg, HBRED, "");
    arg = replace_string(arg, HBGRN, "");
    arg = replace_string(arg, HBYEL, "");
    arg = replace_string(arg, HBBLU, "");
    arg = replace_string(arg, HBMAG, "");
    arg = replace_string(arg, HBCYN, "");
    arg = replace_string(arg, HBWHT, "");
    arg = replace_string(arg, HIDDEN, "");
    return arg;
}

// 增加色彩输出
string ansi(string content)
{
    if (!content)
        return "";

    // Foreground color
    content = replace_string(content, "$BLK$", BLK);
    content = replace_string(content, "$RED$", RED);
    content = replace_string(content, "$GRN$", GRN);
    content = replace_string(content, "$YEL$", YEL);
    content = replace_string(content, "$BLU$", BLU);
    content = replace_string(content, "$MAG$", MAG);
    content = replace_string(content, "$CYN$", CYN);
    content = replace_string(content, "$HIK$", HIK);
    content = replace_string(content, "$WHT$", WHT);
    content = replace_string(content, "$HIR$", HIR);
    content = replace_string(content, "$HIG$", HIG);
    content = replace_string(content, "$HIY$", HIY);
    content = replace_string(content, "$HIB$", HIB);
    content = replace_string(content, "$HIM$", HIM);
    content = replace_string(content, "$HIC$", HIC);
    content = replace_string(content, "$HIW$", HIW);
    content = replace_string(content, "$NOR$", NOR);

    // Background color
    content = replace_string(content, "$BBLK$", BBLK);
    content = replace_string(content, "$BRED$", BRED);
    content = replace_string(content, "$BGRN$", BGRN);
    content = replace_string(content, "$BYEL$", BYEL);
    content = replace_string(content, "$BBLU$", BBLU);
    content = replace_string(content, "$BMAG$", BMAG);
    content = replace_string(content, "$BCYN$", BCYN);
    content = replace_string(content, "$HBRED$", HBRED);
    content = replace_string(content, "$HBGRN$", HBGRN);
    content = replace_string(content, "$HBYEL$", HBYEL);
    content = replace_string(content, "$HBBLU$", HBBLU);
    content = replace_string(content, "$HBMAG$", HBMAG);
    content = replace_string(content, "$HBCYN$", HBCYN);

    content = replace_string(content, "$U$", U);
    content = replace_string(content, "$BLINK$", BLINK);
    content = replace_string(content, "$REV$", REV);
    content = replace_string(content, "$HIREV$", HIREV);
    content = replace_string(content, "$BOLD$", BOLD);
    content = replace_string(content, "$HIDDEN$", HIDDEN);

    return content;
}

void color_cat(string file)
{
    write(ansi(read_file(file)));
}

// calculate the color char in a string
int color_len(string str)
{
    int i, extra;

    extra = 0;
    for (i = 0; i < strlen(str); i++)
    {
        if (str[i] == ESC[0])
        {
            while ((extra++, str[i] != 'm') && i < strlen(str))
                i++;
        }
    }
    return extra;
}

string color_to_html(string msg)
{
    if (!msg)
        return 0;
    msg = replace_string(msg, BLK, "<span style=\"color: #000000\">");
    msg = replace_string(msg, RED, "<span style=\"color: #990000\">");
    msg = replace_string(msg, GRN, "<span style=\"color: #009900\">");
    msg = replace_string(msg, YEL, "<span style=\"color: #999900\">");
    msg = replace_string(msg, BLU, "<span style=\"color: #000099\">");
    msg = replace_string(msg, MAG, "<span style=\"color: #990099\">");
    msg = replace_string(msg, CYN, "<span style=\"color: #669999\">");
    msg = replace_string(msg, WHT, "<span style=\"color: #EEEEEE\">");

    msg = replace_string(msg, HIK, "<span style=\"color: #BBBBBB\">");
    msg = replace_string(msg, HIR, "<span style=\"color: #FF0000\">");
    msg = replace_string(msg, HIG, "<span style=\"color: #00FF00\">");
    msg = replace_string(msg, HIY, "<span style=\"color: #FFFF00\">");
    msg = replace_string(msg, HIB, "<span style=\"color: #0000FF\">");
    msg = replace_string(msg, HIM, "<span style=\"color: #FF00FF\">");
    msg = replace_string(msg, HIC, "<span style=\"color: #00FFFF\">");
    msg = replace_string(msg, HIW, "<span style=\"color: #FFFFFF\">");

    msg = replace_string(msg, BBLK, "<span style=\"background-color: #FFFF00\">");
    msg = replace_string(msg, BRED, "<span style=\"background-color: #990000\">");
    msg = replace_string(msg, BGRN, "<span style=\"background-color: #009900\">");
    msg = replace_string(msg, BYEL, "<span style=\"background-color: #999900\">");
    msg = replace_string(msg, BBLU, "<span style=\"background-color: #000099\">");
    msg = replace_string(msg, BMAG, "<span style=\"background-color: #990099\">");
    msg = replace_string(msg, BCYN, "<span style=\"background-color: #669999\">");
    msg = replace_string(msg, BWHT, "<span style=\"background-color: #EEEEEE\">");

    msg = replace_string(msg, NOR, "</span>");
    msg = replace_string(msg, U, "<span>");
    msg = replace_string(msg, BLINK, "<span>");
    msg = replace_string(msg, REV, "<span>");

    return msg;
}
