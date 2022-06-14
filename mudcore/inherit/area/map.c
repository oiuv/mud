/* map.c write by -Acme-
   这里負責地圖的顯示、对象的移動以及一些設定等等。
*/

#include <ansi.h>
#include <dbase.h>
#include "area.h"

inherit AREA_PROMPT_ICON;

// 區域座標資料(座標对象、圖樣...)
mixed *area;

// Location Of Objects
// 所有存在非区域自动载入对象的座標另成一個集合，以方便快速查找
nosave string *LOO = ({});

// 不能用一般設定方法的項目 (區域形式的出口，要用特別的方式設定)
nosave string *set_data_resist = ({"objects", "loaded", "loads", "area_exit"});

// 不能用一般刪除方法的項目 (可能是區域管理用的項目或其它特別的項目)
nosave string *delete_data_resist = ({"objects", "loaded", "loads"});

varargs int do_look(object me, string arg);

////////////////////////////////////////////////////////////
// 一般設定、檢查、查詢
////////////////////////////////////////////////////////////
// 傳回有对象存在的座標集
string *query_LOO() { return LOO; }
// 加入一個座標元素在LOO集中
void add_LOO(string location)
{
    if (member_array(location, LOO) == -1)
        LOO += ({location});
}
// 刪除一個座標元素在LOO集中
void del_LOO(string location)
{
    if (member_array(location, LOO) != -1)
        LOO -= ({location});
}

// 使用__DIR__之相對路徑
string file_path(string dir)
{
    dir = replace_string(dir, "__DIR__", query("file_path"));
    return dir;
}

// 座標範圍檢查
int check_scope(int x, int y)
{
    if (y < 0 || x < 0 || y >= sizeof(area) || x >= sizeof(area[y]))
        return 0;
    return 1;
}

// 查詢某座標的資訊
mapping *query_info(int x, int y)
{
    if (!check_scope(x, y))
        return 0;
    return area[y][x];
}

// 查詢某座標載入的对象
mapping query_loaded(int x, int y)
{
    if (!check_scope(x, y))
        return ([]);
    return area[y][x]["loaded"];
}

// 查詢區域中某座標的对象集
object *query_inventory(int x, int y)
{
    if (!check_scope(x, y))
        return ({});
    if (undefinedp(area[y][x]["objects"]))
        return ({});
    return area[y][x]["objects"];
}

// 設定區域型出口
int set_area_exit(int x, int y, string filename, int exit_x, int exit_y)
{
    if (!check_scope(x, y))
        return 0;
    area[y][x]["area_exit"] = ([]);
    area[y][x]["area_exit"]["filename"] = filename;
    area[y][x]["area_exit"]["x_axis"] = exit_x;
    area[y][x]["area_exit"]["y_axis"] = exit_y;
    return 1;
}

// 設定區域細節描述
int set_area_detail(int x, int y, string title, string detail)
{
    if (!check_scope(x, y))
        return 0;
    if (undefinedp(area[y][x]["detail"]))
        area[y][x]["detail"] = ([]);
    area[y][x]["detail"][title] = detail;
    return 1;
}

// 刪除區域細節描述
int del_area_detail(int x, int y, string title)
{
    if (!check_scope(x, y))
        return 0;
    if (undefinedp(area[y][x]["detail"]))
        return 1;

    map_delete(area[y][x]["detail"], title);

    if (sizeof(area[y][x]["detail"]) < 1)
        map_delete(area[y][x], "detail");
    return 1;
}

// 取得區域細節資料
mapping query_area_detail(int x, int y)
{
    if (!check_scope(x, y))
        return 0;
    if (undefinedp(area[y][x]["detail"]))
        return ([]);
    return area[y][x]["detail"];
}

// 取得某detail的描述
string query_area_detail_arug(int x, int y, string title)
{
    if (!check_scope(x, y))
        return 0;
    if (undefinedp(area[y][x]["detail"]))
        return 0;
    if (undefinedp(area[y][x]["detail"][title]))
        return 0;
    return area[y][x]["detail"][title];
}

// 設定某方向的guard
int set_area_guard(int x, int y, string exit, object ob)
{
    if (!check_scope(x, y))
        return 0;
    if (!objectp(ob))
        return 0;
    if (undefinedp(area[y][x]["guard"]))
        area[y][x]["guard"] = ([]);
    if (undefinedp(area[y][x]["guard"][exit]))
        area[y][x]["guard"][exit] = ({});
    area[y][x]["guard"][exit] += ({ob});
    return 1;
}

// 查詢某方向是否被guard
int query_area_guard(int x, int y, string exit)
{
    int index;
    object guard;
    if (!check_scope(x, y))
        return 0;
    if (undefinedp(area[y][x]["guard"]))
        return 0;
    if (undefinedp(area[y][x]["guard"][exit]))
        return 0;
    if (!(index = sizeof(area[y][x]["guard"][exit])))
        return 0;
    while (index--)
    {
        if (objectp(guard = area[y][x]["guard"][exit][index]))
            if (guard->query("area_info/x_axis") == x && guard->query("area_info/y_axis") == y)
                if (guard->do_guard_exit(x, y, exit))
                    return 1;
    }
    return 0;
}

// 設定一般資料
int set_data(int x, int y, string type, mixed value)
{
    if (member_array(type, set_data_resist) != -1)
        return 0;
    if (!check_scope(x, y))
        return 0;
    area[y][x][type] = value;
    return 1;
}

// 刪除一般資料
int delete_data(int x, int y, string type)
{
    if (member_array(type, delete_data_resist) != -1)
        return 0;
    if (!check_scope(x, y))
        return 0;
    if (undefinedp(area[y][x][type]))
        return 1;
    map_delete(area[y][x], type);
    return 1;
}

// 取得一般資料
mixed query_data(int x, int y, string type)
{
    if (member_array(type, delete_data_resist) != -1)
        return 0;
    if (!check_scope(x, y))
        return 0;
    if (undefinedp(area[y][x][type]))
        return 0;
    return area[y][x][type];
}

////////////////////////////////////////////////////////////
// 移動
////////////////////////////////////////////////////////////

// 檢查某座標是否有障礙物，是否可穿透
int is_move(int x, int y)
{
    // 如果巫師設定為穿牆模式
    if (wizardp(this_player()) && this_player()->query("option/map_through"))
        return 1;
    if (!check_scope(x, y))
        return 0;
    if (undefinedp(area[y][x]["block"]))
        return 1;
    if (!area[y][x]["block"])
        return 1;
    return 0;
}

// 对象移入某座標處理
int move_in(int x, int y, object ob)
{
    // 超出區域大小範圍
    if (!check_scope(x, y))
        return 0;

    // 該座標沒有对象集(objects)，則將对象集設為空
    if (undefinedp(area[y][x]["objects"]))
        area[y][x]["objects"] = ({});

    // 一格最多容納30個对象
    /*
    if (sizeof(area[y][x]["objects"]) >= 30)
    {
        write("那個方向太多東西了。\n");
        return 0;
    }
    */
    // 对象已經存在对象集(objects)中，就不需要再加入对象集
    if (member_array(ob, area[y][x]["objects"]) != -1)
        return 1;

    // 对象加入对象集中
    area[y][x]["objects"] += ({ob});

    // 改變即時的圖示
    set_icon_weight(x, y, get_icon_weight(ob));

    // 增加LOO搜尋集
    add_LOO((string)y + "," + (string)x);

    return 1;
}

// 对象移出某座標處理
int move_out(int x, int y, object ob)
{
    // 超出區域大小範圍
    if (!check_scope(x, y))
        return 0;

    // 該座標沒有对象集(objects)
    if (undefinedp(area[y][x]["objects"]))
        return 1;

    // 改變即時的圖示
    set_icon_weight(x, y, -get_icon_weight(ob));

    // 对象不存在於对象集(objects)中，就不需要再移出对象集
    if (member_array(ob, area[y][x]["objects"]) == -1)
        return 1;

    // 对象移出对象集
    area[y][x]["objects"] -= ({ob});

    // 座標完全沒对象時，刪除对象集
    if (sizeof(area[y][x]["objects"]) < 1)
    {
        map_delete(area[y][x], "objects");
        // 刪除LOO搜尋集
        del_LOO((string)y + "," + (string)x);
    }

    return 1;
}

// 移动指定对象到当前区域指定方向
int moveObject(object ob, string dir)
{
    int x, y, x_past, y_past;
    x_past = ob->query("area_info/x_axis");
    y_past = ob->query("area_info/y_axis");

    // 座標轉換
    switch (dir)
    {
    case "north":
        y = y_past - 1;
        x = x_past;
        break;
    case "east":
        y = y_past;
        x = x_past + 1;
        break;
    case "south":
        y = y_past + 1;
        x = x_past;
        break;
    case "west":
        y = y_past;
        x = x_past - 1;
        break;
    case "northeast":
        y = y_past - 1;
        x = x_past + 1;
        break;
    case "southeast":
        y = y_past + 1;
        x = x_past + 1;
        break;
    case "southwest":
        y = y_past + 1;
        x = x_past - 1;
        break;
    case "northwest":
        y = y_past - 1;
        x = x_past - 1;
        break;
    default:
        return 0;
        break;
    }

    // 無法移動至該座標(有障礙物)
    if (!check_scope(x, y) || !is_move(x, y))
    {
        write("這個方向沒有出路");
        return 0;
    }

    // 無法往某方向移動因為被某人guard
    if (query_area_guard(x_past, y_past, dir))
        return 0;

    //////////////////////////////
    // 移往別的房間
    //////////////////////////////
    if (!undefinedp(area[y][x]["room_exit"]))
    {
        object room;
        if (!objectp(room = load_object(file_path(area[y][x]["room_exit"]))))
        {
            write("這個方向的出口有問題，請通知管理者來處理。\n");
            return 0;
        }
        if (room->is_area())
        {
            write("這個方向的出口有問題，請通知管理者來處理。\n");
            return 0;
        }
        else
        {
            // 如果成功移到房間, move 會自動在先前的area裡做move_out動作
            if (ob->move(room))
                return 1;
            else
            {
                write("這個方向的出口有問題，請通知管理者來處理。\n");
                return 0;
            }
        }
        return 0;
    }

    //////////////////////////////
    // 移往別的區域
    //////////////////////////////
    if (!undefinedp(area[y][x]["area_exit"]))
    {
        object room;
        if (!objectp(room = load_object(file_path(area[y][x]["area_exit"]["filename"]))))
        {
            write("這個方向的出口有問題，請通知管理者來處理。\n");
            return 0;
        }
        if (!room->is_area())
        {
            write("這個方向的出口有問題，請通知管理者來處理。\n");
            return 0;
        }

        if (!area_move(room, ob, area[y][x]["area_exit"]["x_axis"], area[y][x]["area_exit"]["y_axis"]))
        {
            write("這個方向的出口有問題，請通知管理者來處理。\n");
            return 0;
        }
        return 1;
    }

    //////////////////////////////
    // 移進build
    //////////////////////////////
    /*
    if (!undefinedp(area[y][x]["_BUILDING_FILE_"]))
    {
        object room;
        if (!objectp(room = load_object(this_object()->getBuildFolderPath() + area[y][x]["_BUILDING_FILE_"])))
        {
            write("這個方向的出口有問題，請通知管理者來處理。\n");
            return 0;
        }
        if (room->is_area())
        {
            if (!area_move(room, ob, room->query("entryX"), room->query("entryY")))
                write("這個方向的出口有問題，請通知管理者來處理。\n");
            return 0;
        }
        else
        {
            // 如果成功移到房間, move 會自動在先前的area裡做move_out動作
            if (ob->move(room))
                return 1;
            else
            {
                write("這個方向的出口有問題，請通知管理者來處理。\n");
                return 0;
            }
        }
        return 0;
    }
    */
    //////////////////////////////
    // 在區域中移動
    //////////////////////////////
    // 对象移出舊座標
    if (move_out(x_past, y_past, ob))
    {
        // 对象移入新座標
        if (move_in(x, y, ob))
        {
            ob->set("area_info/x_axis", x);
            ob->set("area_info/y_axis", y);
            ob->set("area_info/x_axis_old", x);
            ob->set("area_info/y_axis_old", y);
        }
        else
        {
            // 对象移入失敗，退回原座標
            move_in(x_past, y_past, ob);
            return 0;
        }
        if (userp(ob))
            do_look(ob, 0);
    }
    else
        return 0;

    return 1;
}
// 移动对象（兼容性别名，不推荐使用）
int valid_leave(object ob, string dir)
{
    debug_message("[警告]请使用 moveObject 方法代替 valid_leave");
    return moveObject(ob, dir);
}

////////////////////////////////////////////////////////////
// 檢視區域環境
////////////////////////////////////////////////////////////

// 查詢某坐標的出口
string *query_exits(int x, int y, int option)
{
    string *exits = ({});

    if (!option)
    {
        // 往北可能有路
        if (y - 1 >= 0)
        {
            if (x - 1 >= 0 && is_move(x - 1, y - 1))
                exits += ({"northwest"});
            if (x >= 0 && is_move(x, y - 1))
                exits += ({"north"});
            if (x + 1 < sizeof(area[0]) && is_move(x + 1, y - 1))
                exits += ({"northeast"});
        }

        // 往南可能有路
        if (y + 1 < sizeof(area))
        {
            if (x - 1 >= 0 && is_move(x - 1, y + 1))
                exits += ({"southwest"});
            if (x >= 0 && is_move(x, y + 1))
                exits += ({"south"});
            if (x + 1 < sizeof(area[0]) && is_move(x + 1, y + 1))
                exits += ({"southeast"});
        }

        // 往東可能有路
        if (x + 1 < sizeof(area[0]) && is_move(x + 1, y))
            exits += ({"east"});

        // 往西可能有路
        if (x - 1 >= 0 && is_move(x - 1, y))
            exits += ({"west"});
    }
    else
    {
        // 往北可能有路
        if (y - 1 >= 0)
        {
            if (x - 1 >= 0 && is_move(x - 1, y - 1))
                exits += ({"西北(" HIK "nw" NOR ")"});
            if (x >= 0 && is_move(x, y - 1))
                exits += ({"北(" HIK "n" NOR ")"});
            if (x + 1 < sizeof(area[0]) && is_move(x + 1, y - 1))
                exits += ({"東北(" HIK "ne" NOR ")"});
        }

        // 往南可能有路
        if (y + 1 < sizeof(area))
        {
            if (x - 1 >= 0 && is_move(x - 1, y + 1))
                exits += ({"西南(" HIK "sw" NOR ")"});
            if (x >= 0 && is_move(x, y + 1))
                exits += ({"南(" HIK "s" NOR ")"});
            if (x + 1 < sizeof(area[0]) && is_move(x + 1, y + 1))
                exits += ({"東南(" HIK "se" NOR ")"});
        }

        // 往東可能有路
        if (x + 1 < sizeof(area[0]) && is_move(x + 1, y))
            exits += ({"東(" HIK "e" NOR ")"});

        // 往西可能有路
        if (x - 1 >= 0 && is_move(x - 1, y))
            exits += ({"西(" HIK "w" NOR ")"});
    }
    return exits;
}

// 地圖顯示
varargs string show_area(int x, int y, int type)
{
    int i, j, x_start, y_start, x_size, y_size;
    string msg;
    // 非utf-8编码下只显示block
    if (query_encoding() != "utf-8") type = 4;
    // 決定顯示地圖的Y軸起點, X軸起點
    y_size = sizeof(area);
    x_size = sizeof(area[0]);

    if (y <= 5 || y_size <= 11)
        y_start = 0;            // 上
    else if (y >= y_size - 6)
        y_start = y_size - 11;  // 中
    else
        y_start = y - 5;        // 下

    if (x <= 19 || x_size <= 38)
        x_start = 0;            // 左
    else if (x >= x_size - 19)
        x_start = x_size - 38;  // 中
    else
        x_start = x - 19;       // 右

    // 建立即時地圖
    msg = sprintf(BBLU "╲" U " %-59s %s (%3d,%3d) " NOR + BBLU "╱\n" NOR,
                  query("name") + (area[y][x]["short"] ? " - " + area[y][x]["short"] : ""),
                  (area[y][x]["no_fight"] ? "安全区" : "戰鬥區"), x, y, );

    for (i = y_start; i < y_size && i < y_start + 11; i++)
    {
        msg += BBLU " |" NOR;
        for (j = x_start; j < x_size && j < x_start + 38; j++)
        {
            if (y == i && x == j)
                msg += (type != 4) ? "😃" : HIY "你" NOR;
            else if (undefinedp(area[i][j]["icon"]) &&
                     (!undefinedp(area[i][j]["room_exit"]) || !undefinedp(area[i][j]["area_exit"])))
                msg += (type != 4) ? "🌀" : HIW "◎" NOR;
            else
            {
                int check = 1;
                if (check && (type & 2) == 2)
                {
                    // 座標有設不即時變更圖示
                    if (!area[i][j]["nonprompt_icon"] && check_icon(j, i))
                    {
                        msg += get_icon(j, i);
                        check = 0;
                    }
                }
                if (check)
                {
                    if ((type & 8) == 8)
                    {
                        if (area[i][j]["_BUILDING_"])
                        {
                            if (!area[i][j]["_BUILDING_FILE_"])
                                msg += "十";
                            else
                                msg += area[i][j]["icon"];
                            check = 0;
                        }
                    }
                    if (check && (type & 4) == 4)
                    {
                        if (area[i][j]["block"])
                        {
                            msg += "口";
                            check = 0;
                        }
                        else
                        {
                            msg += "  ";
                            check = 0;
                        }
                    }
                }

                // 圖形未定
                if (check)
                    msg += area[i][j]["icon"] ? area[i][j]["icon"] : "  ";
            }
        }
        msg += BBLU "| " NOR;
        msg += "\n";
    }
    msg += BBLU "╱" + repeat_string("￣", 39) + "╲" NOR;

    if ((type & 1) == 1)
        return msg;
    else
        return SAVEC + CUP(1,1) + msg + RESTC;
}

varargs string show_objects(int x, int y, int type)
{
    string str = "";
    object ob;

    if (undefinedp(area[y][x]["objects"]))
        return "";

    if (sizeof(area[y][x]["objects"]) >= 30)
        return "这里的東西太多，一時看不清楚...\n";
    // todo 增加排序
    foreach (ob in area[y][x]["objects"])
    {
        if (ob == this_player())
            continue;
        if (!objectp(ob) || environment(ob) != this_object() ||
            ob->query("area_info/y_axis") != y || ob->query("area_info/x_axis") != x)
        {
            area[y][x]["objects"] -= ({ob});
            continue;
        }
        if (!userp(ob) && QUEST_D->hasQuest(this_player(), ob))
            str += sprintf("%s%s\n", BLINK + HIY "！" NOR, ob->short());
        else
            str += sprintf("  %s\n", ob->short());
    }

    return str;
}

varargs int do_look(object me, string arg)
{
    int i = 0, op = 0;
    string str = "", *exits;
    mapping info, option;

    if (!userp(me))
        return 0;

    info = me->query("area_info");
    option = me->query("option");

    if (!info)
        return 0;
    if (!option)
        option = ([]);
    if (!check_scope(info["x_axis"], info["y_axis"]))
        return 0;

    if (arg)
    {
        if ((str = query_area_detail_arug(info["x_axis"], info["y_axis"], arg)))
            message("vision", ansi(str), me);
        else
            return notify_fail("你要看什麼？\n");
        return 1;
    }

    // 是否取消凍結即時地圖
    if (option["map_unfreeze"])
        op = op | 1;

    // 顯示即時圖形變換
    if (!option["map_obj_icon_hidden"])
        op = op | 2;

    // 將原本的地圖圖形變換成二種 有障礙物 與 沒障礙物
    if (option["map_block"])
        op = op | 4;

    // 地圖圖形只顯示建築物及建地
    if (option["map_build"])
        op = op | 8;

    // 长描述
    if (!option["map_long_hidden"])
    {
        string map_long = query_data(info["x_axis"], info["y_axis"], "long");
        if (map_long)
        {
            message("long", ansi(map_long), me);
        }
    }

    // 出口提示
    if (!option["map_exits_hidden"])
    {
        exits = query_exits(info["x_axis"], info["y_axis"], 1);
        if ((i = sizeof(exits)))
        {
            str += "这里的出口有 " NOR;
            while (i--)
                str += exits[i] + (i ? "、" : "。\n");
        }
        else
            str += "这里沒有任何出口。\n";
    }
    // 顯示对象
    if (!option["map_obj_hidden"])
        str += show_objects(info["x_axis"], info["y_axis"], 0);

    message("vision", str, me);
    // 顯示地圖
    if (!option["map_hidden"])
    {
        message("MAP", show_area(info["x_axis"], info["y_axis"], op), me);
    }
    return 1;
}

int map_ansi_save()
{
    int i, j, x, y;
    string file, msg = "", msg2 = "";

    y = sizeof(area);
    x = sizeof(area[0]);

    file = base_name(this_object());

    for (i = 0; i < y; i++)
    {
        for (j = 0; j < x; j++)
        {
            if (j <= 49)
            {
                if (undefinedp(area[i][j]["icon"]))
                    msg += "  ";
                else
                    msg += area[i][j]["icon"];
            }
            else
            {
                if (undefinedp(area[i][j]["icon"]))
                    msg2 += "  ";
                else
                    msg2 += area[i][j]["icon"];
            }
        }
        msg += "\n";
        if (x > 49)
            msg2 += "\n";
    }

    if (x <= 49)
    {
        if (!write_file(file + ".ansi", msg, 1))
            write("儲存ANSI檔失敗。\n");
        else
            write("儲存ANSI檔成功(" + file + ".ansi)。\n");
    }
    else
    {
        write("因為此area寬度超過五十個字大小，故分成左右二個圖檔儲存。\n");
        if (!write_file(file + "_left.ansi", msg, 1))
            write("儲存左半邊ANSI檔失敗。\n");
        else
            write("儲存左半邊ANSI檔成功(" + file + "_left.ansi)。\n");
        if (!write_file(file + "_right.ansi", msg2, 1))
            write("儲存右半邊ANSI檔失敗。\n");
        else
            write("儲存右半邊ANSI檔成功(" + file + "_right.ansi)。\n");
    }

    return 1;
}

int map_html_save()
{
    int i, j, x, y;
    string file, msg = "", tmp;

    y = sizeof(area);
    x = sizeof(area[0]);

    file = base_name(this_object());

    msg += "<html>\n";
    msg += "<head>\n";
    msg += "<title>" + this_object()->query("name") + "</title>\n";
    msg += "</head>\n";
    msg += "<body style=\"background-color: #000\">\n";
    for (i = 0; i < y; i++)
    {
        for (j = 0; j < x; j++)
        {
            if (undefinedp(area[i][j]["icon"]))
                msg += "　";
            else
            {
                tmp = replace_string(area[i][j]["icon"], "  ", "　");
                msg += color_to_html(tmp);
            }
        }
        msg += "<br>\n";
    }
    msg += "\n</body>\n</html>";

    if (!write_file(file + ".html", msg, 1))
    {
        return notify_fail("儲存HTML檔失敗。\n");
    }

    write("儲存HTML檔成功。\n");

    return 1;
}
