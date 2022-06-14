// util.c
#include <localtime.h>
#include <ansi.h>

// filter color
string filter_color(string arg)
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

    return arg;
}

string filter_ansi(string content)
{
    return filter_color(content);
}

// trans_color
// raw = 0, only forecolor
// raw = 1, include backround color
// raw = 2, include blink & others
string trans_color(string arg, int raw)
{
    // forecolor
    arg = replace_string(arg, "$BLK$", BLK);
    arg = replace_string(arg, "$RED$", RED);
    arg = replace_string(arg, "$GRN$", GRN);
    arg = replace_string(arg, "$YEL$", YEL);
    arg = replace_string(arg, "$BLU$", BLU);
    arg = replace_string(arg, "$MAG$", MAG);
    arg = replace_string(arg, "$CYN$", CYN);
    arg = replace_string(arg, "$WHT$", WHT);
    arg = replace_string(arg, "$HIR$", HIR);
    arg = replace_string(arg, "$HIG$", HIG);
    arg = replace_string(arg, "$HIY$", HIY);
    arg = replace_string(arg, "$HIB$", HIB);
    arg = replace_string(arg, "$HIM$", HIM);
    arg = replace_string(arg, "$HIC$", HIC);
    arg = replace_string(arg, "$HIW$", HIW);
    arg = replace_string(arg, "$NOR$", NOR);

    if (raw)
    {
            // Background color
        arg = replace_string(arg, "$BBLK$", BBLK);
        arg = replace_string(arg, "$BRED$", BRED);
        arg = replace_string(arg, "$BGRN$", BGRN);
        arg = replace_string(arg, "$BYEL$", BYEL);
        arg = replace_string(arg, "$BBLU$", BBLU);
        arg = replace_string(arg, "$BMAG$", BMAG);
        arg = replace_string(arg, "$BCYN$", BCYN);
        arg = replace_string(arg, "$HBRED$", HBRED);
        arg = replace_string(arg, "$HBGRN$", HBGRN);
        arg = replace_string(arg, "$HBYEL$", HBYEL);
        arg = replace_string(arg, "$HBBLU$", HBBLU);
        arg = replace_string(arg, "$HBMAG$", HBMAG);
        arg = replace_string(arg, "$HBCYN$", HBCYN);
    }

    if (raw == 2)
    {
            // special effect
        arg = replace_string(arg, "$U$", U);
        arg = replace_string(arg, "$BLINK$", BLINK);
        arg = replace_string(arg, "$REV$", REV);
        arg = replace_string(arg, "$HIREV$", HIREV);
        arg = replace_string(arg, "$BOLD$", BOLD);
    }

    arg += NOR;
    return arg;
}

// append color after the $N〝$n〝$w for the string color won't be
// break by the NOR after the name
string append_color(string arg, string default_color)
{
    arg = replace_string(arg, "$N", "$N" + default_color);
    arg = replace_string(arg, "$n", "$n" + default_color);
    arg = replace_string(arg, "$w", "$w" + default_color);
    return arg;
}

string color_filter(string content)
{
    if (! content)
        return "";

    // Foreground color
    content = replace_string(content, "$BLK$", BLK);
    content = replace_string(content, "$RED$", RED);
    content = replace_string(content, "$GRN$", GRN);
    content = replace_string(content, "$YEL$", YEL);
    content = replace_string(content, "$BLU$", BLU);
    content = replace_string(content, "$MAG$", MAG);
    content = replace_string(content, "$CYN$", CYN);
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

    return content;
}

string color(string content)
{
    return color_filter(content);
}

void color_cat(string file)
{
    if (previous_object())
        seteuid(geteuid(previous_object()));
    else
        seteuid(ROOT_UID);

    write(color_filter(read_file(file)));
}

string color_to_html(string msg)
{
    if( !msg ) return 0;
    msg = replace_string(msg, BLK, "<font color=\"#000000\">");
    msg = replace_string(msg, RED, "<font color=\"#990000\">");
    msg = replace_string(msg, GRN, "<font color=\"#009900\">");
    msg = replace_string(msg, YEL, "<font color=\"#999900\">");
    msg = replace_string(msg, BLU, "<font color=\"#000099\">");
    msg = replace_string(msg, MAG, "<font color=\"#990099\">");
    msg = replace_string(msg, CYN, "<font color=\"#669999\">");
    msg = replace_string(msg, WHT, "<font color=\"#EEEEEE\">");

    msg = replace_string(msg, HIK, "<font color=\"#BBBBBB\">");
    msg = replace_string(msg, HIR, "<font color=\"#FF0000\">");
    msg = replace_string(msg, HIG, "<font color=\"#00FF00\">");
    msg = replace_string(msg, HIY, "<font color=\"#FFFF00\">");
    msg = replace_string(msg, HIB, "<font color=\"#0000FF\">");
    msg = replace_string(msg, HIM, "<font color=\"#FF00FF\">");
    msg = replace_string(msg, HIC, "<font color=\"#00FFFF\">");
    msg = replace_string(msg, HIW, "<font color=\"#FFFFFF\">");

    msg = replace_string(msg, BBLK, "<span style=\"background-color: #FFFF00\">");
    msg = replace_string(msg, BRED, "<span style=\"background-color: #990000\">");
    msg = replace_string(msg, BGRN, "<span style=\"background-color: #009900\">");
    msg = replace_string(msg, BYEL, "<span style=\"background-color: #999900\">");
    msg = replace_string(msg, BBLU, "<span style=\"background-color: #000099\">");
    msg = replace_string(msg, BMAG, "<span style=\"background-color: #990099\">");
    msg = replace_string(msg, BCYN, "<span style=\"background-color: #669999\">");
    msg = replace_string(msg, BWHT, "<span style=\"background-color: #EEEEEE\">");

    msg = replace_string(msg, NOR, "");
    msg = replace_string(msg, U, "");
    msg = replace_string(msg, BLINK, "");
    msg = replace_string(msg, REV, "");

    return msg;
}
