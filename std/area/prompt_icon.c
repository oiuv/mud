/* prompt_icon.c
   即時變換的圖示
*/

// #pragma save_binary

#include <ansi.h>

mapping icon = ([]);

mapping query_icon() { return icon; }

// 取得某物件權重
int get_icon_weight(object ob)
{
    if (wizardp(ob))
        return 27930;
    else if (userp(ob))
        return 931;
    else if (living(ob))
        return 31;
    else if (objectp(ob))
        return 1;
    else
        return 0;
}

// 設定某座標權重
int set_icon_weight(int x, int y, int value)
{
    string coord;

    if (!this_object())
        return 0;
    if (!this_object()->check_scope(x, y))
        return 0;

    coord = (string)x + "," + (string)y;

    icon[coord] += value;

    if (icon[coord] <= 0)
        map_delete(icon, coord);

    return 1;
}

int check_icon(int x, int y)
{
    if (undefinedp(icon[(string)x + "," + (string)y]))
        return 0;
    else
        return 1;
}

string get_icon(int x, int y)
{
    string coord;
    coord = (string)x + "," + (string)y;
    if (icon[coord] >= 27930)
        return HIY "♀" NOR;
    else if (icon[coord] >= 931)
        return HIK "♀" NOR;
    else if (icon[coord] >= 31)
        return HIR "♀" NOR;
    else if (icon[coord] >= 1)
        return "?";
    else
        return "  ";
}

// 移除某座標圖樣
int remove_icon(int x, int y)
{
    if (!undefinedp(icon[(string)x + "," + (string)y]))
        return 1;
    else if (map_delete(icon, (string)x + "," + (string)y))
        return 1;
    return 0;
}

// 刪除所有圖示集
int delete_icon()
{
    icon = ([]);
    return 1;
}
