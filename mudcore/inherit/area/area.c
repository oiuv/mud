/* area.c write by -Acme-
   這裡負責區域对象的載入、清除、重設等工作。
*/

#include "area.h"

inherit CORE_CLEAN_UP;
inherit CORE_DBASE;
inherit CORE_SAVE;

inherit AREA_MAP;

// 區域載入的对象集
// Location Of Loaded Objects
// 所有區域載入之对象的座標另成一個集合，以方便快速查找
string *LOLO = ({});

////////////////////////////////////////////////////////////
// 一般設定、檢查、查詢
////////////////////////////////////////////////////////////
// 傳回有載入对象的座標集
string *query_LOLO() { return LOLO; }
// 加入一個座標元素在LOLO集中
void add_LOLO(string location)
{
    if (member_array(location, LOLO) == -1)
        LOLO += ({location});
}
// 刪除一個座標元素在LOLO集中
void del_LOLO(string location)
{
    if (member_array(location, LOLO) != -1)
        LOLO -= ({location});
}

// 儲存區域資料的路徑位置
string query_save_file() { return file_name(this_object()); }

// 絕對接受对象移入區域对象
int receive_object(object ob, int from_inventory) { return 1; }

// 區域檢查
int is_area() { return 1; }

// 設定某座標要載入的对象檔
int set_loads(int x, int y, string filename, int amount)
{
    if (!check_scope(x, y))
        return 0;
    if (amount <= 0)
        return 0;
    if (undefinedp(area[y][x]["loads"]))
        area[y][x]["loads"] = ([]);
    area[y][x]["loads"][filename] = amount;

    // 加入快速搜尋集
    add_LOLO((string)y + "," + (string)x);
    return 1;
}

// 將某座標要載入的对象檔移除
int del_loads(int x, int y)
{
    if (!check_scope(x, y))
        return 0;
    if (undefinedp(area[y][x]["loads"]))
        return 1;
    map_delete(area[y][x], "loads");

    // 移除快速搜尋集
    del_LOLO((string)y + "," + (string)x);
    return 1;
}

// 將某座標的已載入对象移除
int del_loaded(int x, int y)
{
    if (!check_scope(x, y))
        return 0;
    if (undefinedp(area[y][x]["loaded"]))
        return 1;
    map_delete(area[y][x], "loaded");
    return 1;
}

////////////////////////////////////////////////////////////
// 區域裡的对象載入、清除
////////////////////////////////////////////////////////////
object make_inventory(string file, int x, int y)
{
    string *exits;
    object ob;

    file = file_path(file);
    ob = new (file);

    // Support for uniqueness
    if (ob->violate_unique())
        ob = ob->create_replica();
    if (!ob)
        return 0;

    ob->set("area_info/x_axis", x);
    ob->set("area_info/y_axis", y);
    ob->set("area_info/x_axis_old", x);
    ob->set("area_info/y_axis_old", y);

    // 將对象移到區域裡，並檢查是否有guard某方向
    if (move_in(x, y, ob))
    {
        if ((exits = ob->query("guard_exit")))
        {
            int i = sizeof(exits);
            while (i--)
                this_object()->set_area_guard(x, y, exits[i], ob);
        }
        ob->move(this_object());
    }
    else
        destruct(ob);

    return ob;
}

void reset_callout(int temp)
{
    int i, j, x, y, amount, t = 0;
    mapping ob;
    string file;

    if (!sizeof(LOLO) || temp >= sizeof(LOLO))
        return;

    for (i = temp; i < sizeof(LOLO); i++)
    {
        if (sscanf(LOLO[i], "%d,%d", y, x) != 2)
            continue;
        if (!check_scope(x, y))
            continue;
        if (undefinedp(area[y][x]["loads"]))
            continue;
        if (!mapp(ob = area[y][x]["loaded"]))
            ob = ([]);
        foreach (file, amount in area[y][x]["loads"])
        {
            for (j = amount; j > 0; j--)
            {
                if (objectp(ob[file + " " + j]))
                    continue;
                ob[file + " " + j] = make_inventory(file, x, y);
            }
            area[y][x]["loaded"] = ob;
        }
        t++;
        if (t >= 3)
        {
            call_out("reset_callout", 1, i + 1);
            return;
        }
    }
    return;
}

void reset()
{
    // 清空LOO座標集
    LOO = ({});

    // 对象載入集有資料, 遞迴延遲呼叫產生mob以免cost過多
    call_out("reset_callout", 1, 0);
    return;
}

int clean_up(int inherit_flag)
{
    int i, y, x;
    mapping items;
    string file;
    object ob;

    i = sizeof(LOLO);
    while (i--)
        if (sscanf(LOLO[i], "%d,%d", y, x) == 2)
        {
            if (!mapp(items = query_loaded(x, y)))
                continue;
            foreach (file, ob in items)
                if (objectp(ob) && ob->is_character() && environment(ob) != this_object())
                    return 1;
        }

    return ::clean_up(inherit_flag);
}

// 區域消滅時呼叫此函式
void remove()
{
    int i, y, x, cnt;
    mapping items;
    string file;
    object ob;

    i = sizeof(LOLO);
    while (i--)
        if (sscanf(LOLO[i], "%d,%d", y, x) == 2)
        {
            if (!mapp(items = query_loaded(x, y)))
                continue;
            foreach (file, ob in items)
            {
                if (objectp(ob))
                {
                    message("vision", ob->name() + "化成輕飄飄的白煙消散了。", environment(ob));
                    destruct(ob);
                    cnt++;
                }
            }
            // 清空座標对象集，以免往後出錯
            map_delete(area[y][x], "objects");

            // 清空座標已載入对象之資料，以免往後出錯
            map_delete(area[y][x], "loaded");
        }

    if (cnt && this_player())
        write("警告：" + cnt + " 個NPC由此區域創造並被強制刪除。\n");
}

int save()
{
    int i, j, x_size, y_size;
    mapping LOADED_BAK, OBJECTS_BAK;
    mixed *AREA_BAK;

    // 存檔前將不需要儲取的變數清空，以免往後發生無法預期的錯誤
    AREA_BAK = area;

    LOADED_BAK = ([]);
    OBJECTS_BAK = ([]);

    x_size = this_object()->query("x_axis_size");
    y_size = this_object()->query("y_axis_size");

    // 每格座標中的暫時變數也要清空, 並暫存起來
    for (i = 0; i < y_size; i++)
    {
        if (undefinedp(LOADED_BAK[i]))
            LOADED_BAK[i] = ([]);
        if (undefinedp(OBJECTS_BAK[i]))
            OBJECTS_BAK[i] = ([]);
        for (j = 0; j < x_size; j++)
        {
            LOADED_BAK[i][j] = area[i][j]["loaded"];
            OBJECTS_BAK[i][j] = area[i][j]["objects"];
            map_delete(area[i][j], "loaded");  // loaded -> mapping
            map_delete(area[i][j], "objects"); // objects -> array
        }
    }

    if (::save())
    {
        // 儲存完便還原
        area = AREA_BAK;

        for (i = 0; i < y_size; i++)
        {
            for (j = 0; j < x_size; j++)
            {
                area[i][j]["loaded"] = LOADED_BAK[i][j];
                area[i][j]["objects"] = OBJECTS_BAK[i][j];
            }
        }
        return 1;
    }

    return 0;
}

void setup()
{
    int i;
    string file;

    seteuid(getuid());

    // 沒有儲存檔
    if (!restore())
    {
        int j, y_size, x_size;

        // 將區域資料變數 area 作初始化
        y_size = this_object()->query("y_axis_size");
        x_size = this_object()->query("x_axis_size");
        if (!y_size || y_size < AREA_YAXIS_MIN || y_size > AREA_YAXIS_MAX)
            y_size = DEFAULT_YAXIS_SIZE;
        if (!x_size || x_size < AREA_XAXIS_MIN || x_size > AREA_XAXIS_MAX)
            x_size = DEFAULT_XAXIS_SIZE;

        // 要求記憶體
        area = allocate(y_size);
        for (i = 0; i < sizeof(area); i++)
        {
            area[i] = allocate(x_size);
            for (j = 0; j < sizeof(area[i]); j++)
                area[i][j] = ([]);
        }

        // 清空相關对象集
        LOO = ({});
        LOLO = ({});

        // 儲存
        save();
    }

    // update 相對路徑
    file = base_name(this_object());
    i = strlen(file);
    while (i--)
        if (file[i..i] == "/")
            break;
    set("file_path", file[0..i]);

    this_object()->reset();
}
