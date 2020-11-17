// 自定义进度条绘图
#include <ansi.h>

varargs string graph_draw(int cur, int max, int fc, int bc, int length)
{
    mixed color = ({
        ({"", ""}), ({RED, BRED}), ({GRN, BGRN}), ({CYN, BCYN}),
        ({BLU, BBLU}), ({YEL, BYEL}), ({MAG, BMAG}), ({WHT, HBWHT}
    )});
    string *pic = ({"　", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"});
    string result = "";
    int now_len, flag = 0;
    float last_len, temp;

    if (!length)
        length = 40;
    if (fc < 0 || fc > 7)
        fc = 1 + random(7);
    if (bc < 0 || bc > 7)
        bc = 1 + random(7);
    if (max < 1)
        max = 1;
    if (cur < 0)
        cur = 0;
    //if( max < cur ) return sprintf("%"+(length*2-18)+"Oops! There's something wrong with it!","");
    if (max < cur)
    {
        flag = 1;
        cur = max;
    }


    cur *= 1000;
    max *= 1000;

    now_len = floor(cur / (max / to_float(length)));
    last_len = cur % (max / length);
    last_len ? temp = last_len / ((max / length) / 8.) : 0.;
    if (cur)
        result = sprintf(color[fc][1] + "%-" + now_len * 2 + "s", " ");
    if (flag)
        result[ < 2..] = ">>";
    if (now_len < length)
    {
        if (cur == max && temp > 0 && temp < 1)
            result += sprintf(color[fc][1] + "%-2s", " ");
        else
            result += sprintf(NOR + color[fc][0] + color[bc][1] + pic[to_int(temp)] + NOR + color[bc][1] + "%-" + ((length - now_len) * 2 - 2) + "s", " ");
    }

    return result + NOR;
}
