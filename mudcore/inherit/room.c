/*****************************************************************************
Copyright: 2019, Mud.Ren
File name: room.c
Description: 通用游戏环境设置接口，通过reset()自动加载物品对象到房间
Author: xuefeng
Version: v1.0
Date: 2019-03-12
*****************************************************************************/
#include <ansi.h>
#include <dbase.h>

#ifndef DOOR_CLOSED
#define DOOR_CLOSED             1
#endif
#ifndef DOOR_LOCKED
#define DOOR_LOCKED             2
#endif
#ifndef DOOR_SMASHED
#define DOOR_SMASHED            4
#endif

/**
 * 本接口需要继承CORE_DBASE接口才能正常使用数据存取
 * 本接口需要继承CORE_NAME接口才能使用short()、long()方法，或者自己实现相关方法
 */
// inherit CORE_CLEAN_UP;
// inherit CORE_DBASE;
// inherit CORE_NAME;

nosave mapping doors;

object make_inventory(string file);

// void create(){}

// driver自动定期呼叫此apply,可继承后增加清理环境中对象的功能
void reset()
{
    /**
     * ob_list:需要加载的对象map列表
     * ob:加载后的对象map列表
     */
    mapping ob_list, ob;
    string file;
    int amount;
    /*
    write_file(LOG_DIR + "reset", "[ROOM]->reset():" +
            sprintf("%-40s%s", file_name(this_object()), ctime(time()) + "\n"));
    */
    // 仅继承对象继续执行
    if (!inherits(CORE_ROOM, this_object()))
    {
        return;
    }

    if (!mapp(ob_list = query("objects")))
        return;

    if (!mapp(ob = query_temp("objects")))
        ob = ([]);

    foreach(file, amount in ob_list)
    {
        if (amount == 1)
        {
            if(!objectp(ob[file]))
                ob[file] = make_inventory(file);
            else if (environment(ob[file]) != this_object() && ob[file]->is_character())
            {
                if (!ob[file]->return_home(this_object()))
                    add("no_clean_up", 1); // 因为某些原因未能正常回来，设为可被清除掉
            }
        }
        else
        {
            if (!arrayp(ob[file]) || (sizeof(ob[file]) != amount))
                ob[file] = allocate(amount);
            for(int i = 0; i < amount; i++)
            {
                if(!objectp(ob[file][i]))
                {
                    ob[file][i] = make_inventory(file);
                }
                else if (environment(ob[file][i]) != this_object() && ob[file][i]->is_character())
                {
                    if (!ob[file][i]->return_home(this_object()))
                        add("no_clean_up", 1); // 因为某些原因未能正常回来，设为可被清除掉
                }
            }
        }
    }
    set_temp("objects", ob);
    // debug_message(sprintf("%s : %O",log_time(), ob));
}

void setup()
{
    reset();
}

object make_inventory(string file)
{
    object ob;

    if (!objectp(ob = new(file)))
        return 0;

    ob->set("home", base_name(this_object())); // 设置对象所在环境
    ob->move(this_object());
    return ob;
}

// 设置环境区域和坐标
varargs void setArea(mixed area, int x, int y, int z)
{
    set("area", area);
    set("zone", ([
        "x":x,
        "y":y,
        "z":z,
    ]));
}

varargs void set_area(mixed area, int x, int y, int z)
{
    setArea(area, x, y, z);
}

// 获取区域坐标
string coordinate()
{
    mapping coordinate = query("zone");
    int x, y, z;

    if (!mapp(coordinate))
        coordinate = ([]);
    x = coordinate["x"];
    y = coordinate["y"];
    z = coordinate["z"];

    return sprintf("(%d,%d,%d)", x, y, z);
}

// 移除一个出口
void removeExit(string dir)
{
    mapping exits = query("exits");
    if (mapp(exits) && exits[dir])
        map_delete(exits, dir);
}

void remove_exit(string dir)
{
    removeExit(dir);
}

// 移除随机出口
void removeRandomExit()
{
    mapping exits = query("exits");
    if (mapp(exits) && sizeof(exits) > 1)
    {
        removeExit(element_of(keys(exits)));
    }
}

void remove_random_exit()
{
    removeRandomExit();
}

// 增加一个出口
void addExit(string dir, mixed dest)
{
    mapping exits = query("exits");
    if (!mapp(exits))
        exits = ([]);
    if (!exits[dir])
        exits[dir] = dest;
}

void add_exit(string dir, mixed dest)
{
    addExit(dir, dest);
}

// 移除出口
void removeExitN(int y, int x1, int x2)
{
    if (query("zone/y") == y && query("zone/x") >= x1 && query("zone/x") <= x2)
    {
        removeExit("north");
    }
}
void removeExitS(int y, int x1, int x2)
{
    if (query("zone/y") == y && query("zone/x") >= x1 && query("zone/x") <= x2)
    {
        removeExit("south");
    }
}
void removeExitW(int x, int y1, int y2)
{
    if (query("zone/x") == x && query("zone/y") >= y1 && query("zone/y") <= y2)
    {
        removeExit("west");
    }
}
void removeExitE(int x, int y1, int y2)
{
    if (query("zone/x") == x && query("zone/y") >= y1 && query("zone/y") <= y2)
    {
        removeExit("east");
    }
}
// 上
void removeExitX(int y, int x1, int x2)
{
    removeExitN(y, x1, x2);
    removeExitS(y + 1, x1, x2);
}
// 左
void removeExitY(int x, int y1, int y2)
{
    removeExitW(x, y1, y2);
    removeExitE(x - 1, y1, y2);
}
// 设置房间区域(参数:任意对角线的二个坐标)
void setRoomArea(int x1, int y1, int x2, int y2)
{
    int tx1 = min(({x1, x2}));
    int ty1 = min(({y1, y2}));
    int tx2 = max(({x1, x2}));
    int ty2 = max(({y1, y2}));
    removeExitX(ty2, tx1, tx2);
    removeExitX(ty1 - 1, tx1, tx2);
    removeExitY(x1, y1, y2);
    removeExitY(x2 + 1, y1, y2);
}

// 查询光亮级别
int query_light()
{
    int light = efun::set_light(0);
    // 亮度调节
    light += NATURE_D->light(this_object());
    // 最小亮度0
    if (light < 0)
    {
        light = 0;
    }
    // 最大亮度15
    else if (light > 15)
    {
        light = 15;
    }

    return light;
}
// 增加光亮级别
void add_light(int light)
{
    efun::set_light(light);
}

// 是否有权到指定方向，可覆盖
int valid_leave(object me, string dir)
{
    if (mapp(doors) && !undefinedp(doors[dir]))
    {
        if (doors[dir]["status"] & DOOR_CLOSED)
            return notify_fail("你必须先把" + doors[dir]["name"] + "打开！\n");
    }
    return 1;
}

mapping query_doors() { return doors; }

string look_door(string dir)
{
    if (!mapp(doors) || undefinedp(doors[dir]))
        return "你要看什么？\n";
    if (doors[dir]["status"] & DOOR_CLOSED)
        return "这个" + doors[dir]["name"] + "是关着的。\n";
    else
        return "这个" + doors[dir]["name"] + "是开着的。\n";
}

varargs void set_door(string dir, mixed data, string other_side_dir, int status)
{
    mapping d, exits;
    object ob;

    exits = query("exits");
    if (!mapp(exits) || undefinedp(exits[dir]))
        error("Room: create_door: attempt to create a door without exit.\n");

    if (stringp(data))
    {
        d = allocate_mapping(4);
        d["name"] = data;
        d["id"] = ({dir, data, "door"});
        d["other_side_dir"] = other_side_dir;
        d["status"] = status;
    }
    else if (mapp(data))
        d = data;
    else
        error("Create_door: Invalid door data, string or mapping expected.\n");

    set("item_desc/" + dir, (: look_door, dir :));

    if (objectp(ob = find_object(exits[dir])))
    {
        if (!ob->check_door(other_side_dir, d))
            return;
    }

    if (!mapp(doors))
        doors = ([dir:d]);
    else
        doors[dir] = d;
}

varargs void create_door(string dir, mixed data, string other_side_dir, int status)
{
    set_door(dir, data, other_side_dir, status);
}

varargs int open_door(string dir, int from_other_side)
{
    mapping exits;
    object ob;

    if (!mapp(doors) || undefinedp(doors[dir]))
        return notify_fail("这个方向没有门。\n");

    if (!(doors[dir]["status"] & DOOR_CLOSED))
        return notify_fail(doors[dir]["name"] + "已经是开着的了。\n");

    exits = query("exits");
    if (!mapp(exits) || undefinedp(exits[dir]))
        error("Room: open_door: attempt to open a door with out an exit.\n");

    if (from_other_side)
        message("vision", "有人从另一边将" + doors[dir]["name"] + "打开了。", this_object());
    else if (objectp(ob = find_object(exits[dir])))
    {
        if (!ob->open_door(doors[dir]["other_side_dir"], 1))
            return 0;
    }

    doors[dir]["status"] &= (!DOOR_CLOSED);
    return 1;
}

varargs int close_door(string dir, int from_other_side)
{
    mapping exits;
    object ob;

    if (!mapp(doors) || undefinedp(doors[dir]))
        return notify_fail("这个方向没有门。\n");

    if ((doors[dir]["status"] & DOOR_CLOSED))
        return notify_fail(doors[dir]["name"] + "已经是关着的了。\n");

    exits = query("exits");
    if (!mapp(exits) || undefinedp(exits[dir]))
        error("Room: close_door: attempt to open a door with out an exit.\n");

    if (from_other_side)
        message("vision", "有人从另一边将" + doors[dir]["name"] + "关上了。", this_object());
    else if (objectp(ob = find_object(exits[dir])))
    {
        if (!ob->close_door(doors[dir]["other_side_dir"], 1))
            return 0;
    }

    doors[dir]["status"] |= DOOR_CLOSED;
    return 1;
}

// todo 增加上锁开锁相关接口

int check_door(string dir, mapping door)
{
    if (!mapp(doors) || undefinedp(doors[dir]))
        return 1;

    door["status"] = doors[dir]["status"];
    return 1;
}

mixed query_door(string dir, string prop)
{
    if (!mapp(doors) || undefinedp(doors[dir]))
        return 0;
    else
        return doors[dir][prop];
}

//replaces the program in this_object()
void replace_program(string ob)
{
    if (replaceable(previous_object()))
    {
        efun::replace_program(ob);
    }
}
