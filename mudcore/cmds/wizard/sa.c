/** set area
 *  設定區域目前所處座標的相關資料。
 */
#include <ansi.h>

inherit CORE_CLEAN_UP;

void create() { seteuid(getuid()); }

void show_info(object me, mapping coord)
{
    int i;
    mixed type;
    mapping info;
    string msg;

    info = environment(me)->query_info(coord["x_axis"], coord["y_axis"]);

    if (!sizeof(info))
        return;

    msg = sprintf(HIW "========================= %-8s (%2d,%2d) =========================\n" NOR,
                  environment(me)->query("name"), coord["x_axis"], coord["y_axis"]);
    msg += BYEL "[檔案]" NOR + " " + file_name(environment(me)) + ".c\n";

    foreach (type in keys(info))
        switch (type)
        {
        case "objects": // 存在於座標上的对象
            msg += BRED "[系統]" NOR " 目前存在於這個座標的对象(objects)：\n";
            if ((i = sizeof(info["objects"])))
            {
                while (i--)
                    msg += "       " + file_name(info["objects"][i]) + "\n";
            }
            break;

        case "loaded": // 已經載入的对象
            msg += BRED "[系統]" NOR " 已經載入的对象(loaded)：\n";
            if ((i = sizeof(info["loaded"])))
            {
                mixed *k, *v;
                k = keys(info["loaded"]);
                v = values(info["loaded"]);
                while (i--)
                    msg += "       " + k[i] + "：" + (objectp(v[i]) ? file_name(v[i]) : "不存在") + "\n";
            }
            break;

        case "loads": // 座標要載入的对象集
            msg += BBLU "[設定]" NOR " 座標載入的对象集(loads)：\n";
            if ((i = sizeof(info["loads"])))
            {
                mixed *k, *v;
                k = keys(info["loads"]);
                v = values(info["loads"]);
                while (i--)
                    msg += "       檔案：" + k[i] + ", 數量：" + v[i] + "\n";
            }
            break;

        case "room_exit": // 座標的房間型式出口
            msg += BBLU "[設定]" NOR " 房間型式出口(room_exit) 檔案：" + info["room_exit"] + "\n";
            break;

        case "area_exit": // 座標的區域型式出口
            msg += BBLU "[設定]" NOR " 區域型式出口(area_exit) 檔案：" + info["area_exit"]["filename"];
            msg += "  坐標：(" + info["area_exit"]["x_axis"] + "," + info["area_exit"]["y_axis"] + ")\n";
            break;

        case "detail":
            msg += BBLU "[設定]" NOR " 細節描述(detail)：\n";
            if ((i = sizeof(info["detail"])))
            {
                mixed *k, *v;
                k = keys(info["detail"]);
                v = values(info["detail"]);
                while (i--)
                    msg += "       " + k[i] + "：" + v[i] + "\n";
            }
            break;
        case "guard":
            break;
        default: // 其它設定
            msg += BGRN "[設定]" NOR " ";
            msg += type + "：" + info[type] + "\n";
            break;
        }
    msg += HIW "====================================================================\n" NOR;
    write(msg);
}

int main(object me, string arg)
{
    mixed value;
    string type, control, file;
    mapping info;

    if (!environment(me))
        return 0;

    if (!environment(me)->is_area())
    {
        write("這指令只能在區域中使用。\n");
        return 1;
    }
    file = base_name(environment(me));

    if (!(info = me->query("area_info")))
    {
        write("使用指令出現錯誤。\n");
        return 1;
    }

    if (!arg)
    {
        show_info(me, info);
        return 1;
    }

    if (arg == "save")
    {
        if (environment(me)->save())
        {
            write("區域儲存成功。\n");
            return 1;
        }
        write("區域儲存失敗。\n");
        return 1;
    }

    if (arg == "save_ansi")
    {
        environment(me)->map_ansi_save();
        return 1;
    }

    if (arg == "save_html")
    {
        environment(me)->map_html_save();
        return 1;
    }

    if (arg == "loads")
    {
        int x, y, i;
        string *lolo;
        lolo = environment(me)->query_LOLO();
        if ((i = sizeof(lolo)) > 0)
        {
            write("==================== 目前這個區域有載入对象的座標 ====================\n");
            while (i--)
            {
                if (sscanf(lolo[i], "%d,%d", y, x) == 2)
                {
                    write(sprintf("(%2d,%2d) ", x, y));
                    if (i >= 8 && i % 8 == 0)
                        write("\n");
                }
            }
            write("\n======================================================================\n");
        }
        else
            write("這個區域目前都還沒有要載入的对象。\n");
        return 1;
    }

    if (arg == "pattern")
    {
        AREA_PATTERN_D->listPatterns();
        return 1;
    }

    if (sscanf(arg, "%s %d -%s", type, value, control) == 3)
    {
        if (type == "pattern" && control == "s")
        {
            AREA_PATTERN_D->setPattern(me, value);
            write("ok.\n");
            return 1;
        }
    }

    if (sscanf(arg, "%s %d", type, value) == 2)
    {
        if (type == "pattern")
        {
            AREA_PATTERN_D->patternInfo(value);
            return 1;
        }
    }

    if (sscanf(arg, "%s %d", type, value) != 2)
        if (sscanf(arg, "%s %s", type, value) != 2)
        {
            write("指令參數不正確。\n");
            return 1;
        }

    if (value == "delete")
    {
        if (type == "loads")
        {
            if (!environment(me)->del_loads(info["x_axis"], info["y_axis"], value))
            {
                write("刪除座標載入对象失敗。\n");
                return 1;
            }
            write("刪除座標載入对象成功。\n");
            return 1;
        }
        if (!environment(me)->delete_data(info["x_axis"], info["y_axis"], type))
        {
            write("刪除失敗。\n");
            return 1;
        }
        write("你將座標 (" + info["x_axis"] + "," + info["y_axis"] + ") 的 " + type + " 資料刪除。\n");
        return 1;
    }

    // 設定區域形式出口
    if (type == "area_exit")
    {
        int x, y;
        string filename;
        if (sscanf(value, "%s %d %d", filename, x, y) != 3)
        {
            write("區域形式出口設定錯誤。 (指令格式：sa area_exit FILE_NAME X_AXIS Y_AXIS)\n");
            return 1;
        }
        if (!environment(me)->set_area_exit(info["x_axis"], info["y_axis"], filename, x, y))
        {
            write("區域形式出口設定失敗。\n");
            return 1;
        }
        write("區域形式出口設定成功。\n");
        return 1;
    }

    // 設定載入对象集
    if (type == "loads")
    {
        int amount;
        string filename;
        if (sscanf(value, "%s %d", filename, amount) != 2)
        {
            write("區域載入对象設定錯誤。 (指令格式：sa loads FILE_NAME AMOUNT)\n");
            return 1;
        }

        if (!environment(me)->set_loads(info["x_axis"], info["y_axis"], filename, amount))
        {
            write("區域載入对象設定失敗。\n");
            return 1;
        }
        write("區域載入对象設定成功。\n");
        return 1;
    }

    if (type == "detail")
    {
        string title, detail;
        if (sscanf(value, "%s %s", title, detail) == 2)
        {
            if (environment(me)->set_area_detail(info["x_axis"], info["y_axis"], title, detail))
                write("設定細節描述成功。\n");
        }
        else
            write("設定細節描述失敗。\n");
        return 1;
    }

    // 如果是設定icon先轉換色碼
    if (type == "icon")
    {
        value = ansi(value);
        if (strwidth(remove_ansi(value)) != 2)
        {
            write("設定座標上的icon字符宽度必须为2（如：一个汉字或2个字母）。\n");
            return 1;
        }
    }

    // 其它項目設定
    if (!environment(me)->set_data(info["x_axis"], info["y_axis"], type, value))
    {
        write("設定失敗。\n");
        return 1;
    }

    write("你將座標 (" + info["x_axis"] + "," + info["y_axis"] + ") 的 " + type + " 資料設定為 " + value + " 。\n");

    return 1;
}

int help(object me)
{
    string msg = "這是用來設定區域目前所處座標的相關資料的指令。\n" BBLU "\n1. 指令格式： sa\n" NOR
                 "   可以列出目前所處座標的相關資訊。\n" BBLU "\n2. 指令格式： sa loads\n" NOR
                 "   查詢區域中會載入对象的所有座標列表。\n" BBLU "\n3. 指令格式： sa loads FILE_NAME AMOUNT\n" NOR
                 "   這個指令可以設定目前身處的座標，會自動載入某对象於此座標中。\n"
                 "   例： sa loads __DIR__npc 2      這樣會載入相對目錄路徑中的檔名npc二隻在座標上。\n"
                 "        sa loads __DIR__npc/mob 4  這樣會載入相對路徑中npc目錄下的mob檔案四隻在座標上。\n" BBLU "\n4. 指令格式： sa area_exit FILE_NAME X_AXIS Y_AXIS\n" NOR
                 "   這個指令可設定區域型式的出口。\n"
                 "   例： sa area_exit __DIR__area 50 20  當人物移到這裡時，會自動轉移到area這個區域的(50,20)位置。\n" BBLU "\n5. 指令格式： sa room_exit FILE_NAME\n" NOR
                 "   這個指令可以設定房間型式的出口。\n"
                 "   例： sa room_exit __DIR__room  當人物移到這裡時，會自動轉移到房間room中。\n" BBLU "\n6. 指令格式： sa detail TITLE DETAIL\n" NOR
                 "   這個指令是用來設定房間的細節描述的，支援search, look指令，應用於quest。\n"
                 "   例： sa detail 大樹 這是一棵大樹，或許你可以爬(climb)上去。\n" BBLU "\n7. 指令格式： sa TYPE VALUE\n" NOR
                 "   這個指令是用來設定其它功能的設定。\n"
                 "   例： sa icon $YEL$屎$NOR$  設定圖示, 此指令支援色碼。\n"
                 "        sa no_fight 1         非戰區\n"
                 "        sa nonprompt_icon 1   不會即時改變圖示的設定(意思是人物、对象移到這座標時圖示不會改變)\n"
                 "        sa short 道路         設定座標的短序述\n"
                 "        sa long xxxxxxxx      設定座標的長序述，如果太長最好配合to指令, 如： to sa long\n"
                 "        sa block 1            設定成為障礙區，無法移動過來。\n" BBLU "\n8. 指令格式： sa TYPE delete\n" NOR
                 "   這是用來刪除區域資料的指令。\n"
                 "   例： sa loads delete      刪除座標的載入对象集\n"
                 "        sa area_exit delete  刪除座標的區域型式出口\n"
                 "        sa room_exit delete  刪除座標的房間型式出口\n"
                 "        sa icon delete       刪除座標的圖示\n" BBLU "\n9. 指令格式： sa save\n" NOR
                 "   這是儲存區域檔案的指令，當區域做了一些變更後，必需使用此指令來儲存。\n" BBLU "\n10. 指令格式： sa save_ansi\n" NOR
                 "   這是儲存區域全圖的指令，用來配合map指令。\n" BBLU "\n11. 指令格式： sa save_html\n" NOR
                 "   這是儲存區域全圖的指令，用於網頁上。\n"
                 "\n註：在區域裡可使用的檔案路徑：\n"
                 "      __DIR__     相對路徑，區域的目錄在哪 __DIR__ 便指向哪\n" BRED "\n12. 指令格式：sa pattern           " NOR "  列出可用的 Area Pattern\n" BRED "              sa pattern <編號>    " NOR "  顯示某編號的 Area Pattern 內容\n" BRED "              sa pattern <編號> -s " NOR "  將某編號的 Area Pattern 套用在身處的area中\n";
    me->more(msg);
    return 1;
}
