/*****************************************************************************
Copyright: 2020, Mud.Ren
File name: go.c
Description: 基础移动指令
Author: xuefeng
Version: v1.0
*****************************************************************************/
#include <ansi.h>
#include <type.h>
inherit CORE_VERB;

int do_area_move(object me, object env, string dir);
int do_room_move(object me, object env, string dir);

nosave mapping default_dirs = ([
        "north":"北方",
        "south":"南方",
         "east":"东方",
         "west":"西方",
      "northup":"北边",
      "southup":"南边",
       "eastup":"东边",
       "westup":"西边",
    "northdown":"北边",
    "southdown":"南边",
     "eastdown":"东边",
     "westdown":"西边",
    "northeast":"东北",
    "northwest":"西北",
    "southeast":"东南",
    "southwest":"西南",
           "up":"上面",
         "down":"下面",
           "in":"里面",
          "out":"外面",
]);

nosave mapping r_dirs = ([
        "north":"south",
        "south":"north",
         "east":"west",
         "west":"east",
      "northup":"southdown",
      "southup":"northdown",
       "eastup":"westdown",
       "westup":"eastdown",
    "northdown":"southup",
    "southdown":"northup",
     "eastdown":"westup",
     "westdown":"eastup",
    "northeast":"southwest",
    "northwest":"southeast",
    "southeast":"northwest",
    "southwest":"northeast",
           "up":"down",
         "down":"up",
           "in":"out",
          "out":"in",
]);

nosave mapping empty_mapping = ([]);

protected void create()
{
    verb::create();
    setVerb("go");
    setSynonyms("move");
    setRules("STR");
    setErrorMessage("你想去哪儿？");
}

mixed can_go_str(string dir, string arg)
{
    return 1;
}

int do_go_str(string dir, string arg)
{
    object me = this_player();
    object env = environment(me);

    if (env->is_area())
        return do_area_move(me, env, arg);
    else
        return do_room_move(me, env, arg);
}

int do_room_move(object me, object env, string dir)
{
    string dir_name, msg_in, msg_out;
    object obj;
    mapping exit;
    mixed dest;
    int result;

    if (!mapp(exit = env->query("exits")) || undefinedp(exit[dir]))
    {
        if (query_verb() == "go")
            return notify_fail("这个方向没有出路。\n");
    }

    dest = exit[dir];

    switch (typeof(dest))
    {
    case T_OBJECT:
        obj = dest;
        break;
    case T_STRING:
        if (!objectp(obj = load_object(dest)))
        {
            return notify_fail(sprintf("目标环境异常，无法向 %s 移动。\n", dest));
        }
        break;
    case T_MAPPING:
        if (undefinedp(dest["filename"]) || undefinedp(dest["x_axis"]) || undefinedp(dest["y_axis"]))
        {
            return notify_fail(sprintf("目标方向异常，无法向 %s 移动。\n", dir));
        }
        if (!objectp(obj = load_object(dest["filename"])))
        {
            return notify_fail(sprintf("目标环境异常，无法向 %s 移动。\n", dest["filename"]));
        }
        break;
    // case T_INT:
    // case T_FLOAT:
    // case T_ARRAY:
    default:
        return notify_fail("这个方向的出口有问题，请联系巫师处理。\n");
    }

    if (undefinedp(dir_name = default_dirs[dir]))
        dir_name = dir;

    // 特殊方向限制移动
    result = env->valid_leave(me, dir);
    // debug_message("valid_leave:" + result);
    if (!result)
        return 1;

    msg_out = me->query("name") + "往" + dir_name + "离开了。";
    message("info", msg_out, environment(me), ({me}));
    msg_in = me->query("name") + "走了过来。";
    // move I to dest
    if (obj->is_area())
    {
        if (area_move(obj, me, dest["x_axis"], dest["y_axis"]))
        {
            object *obs;
            obs = obj->query_inventory(dest["x_axis"], dest["y_axis"]);
            tell_area(obj, dest["x_axis"], dest["y_axis"], msg_in, ({me}));
            // 對進入的座標做init()動作
            if (sizeof(obs))
                obs->init();
        }
        else
            return notify_fail("移动失败！！\n");
    }
    else if (!me->move(obj))
        return notify_fail("移动失败！\n");
    else
        message("info", msg_in, environment(me), ({me}));

    return 1;
}

int do_area_move(object me, object env, string dir)
{
    int x, y;
    string *area_exits, dir_name, min, mout;
    object new_env, *obs;
    mapping info;

    if (!(info = me->query("area_info")))
        return 0;

    x = info["x_axis"];
    y = info["y_axis"];

    area_exits = env->query_exits(x, y);

    if (member_array(dir, area_exits) == -1)
    {
        write("這個方向沒有出路。\n");
        return 1;
    }

    if (undefinedp(dir_name = default_dirs[dir]))
        dir_name = dir;

    // 檢查area是否合法的移動并通过valid_leave实现移动
    if (function_exists("moveObject", env) && !env->moveObject(me, dir))
        return 1;

    mout = "往" + dir_name + "離開。";
    min = "走了過來。";
    new_env = environment(me);

    if (undefinedp(dir_name = default_dirs[dir]))
        dir_name = dir;

    // 顯示離開訊息
    tell_area(env, x, y, me->name() + mout, ({me}));

    if (new_env->is_area())
    {
        // 顯示進入訊息
        tell_area(new_env, info["x_axis"], info["y_axis"], me->name() + min, ({me}));

        // 對進入的座標做init()動作
        obs = new_env->query_inventory(info["x_axis"], info["y_axis"]);
        // 本质上还在一个环境中，需要主动调用init()
        if (sizeof(obs) > 1)
            obs->init();
    }
    else
        tell_room(new_env, me->name() + min, me);

    return 1;
}

string query_reverse(string dir)
{
    if (undefinedp(r_dirs[dir]))
        return 0;
    return r_dirs[dir];
}

string query_chinese_dir(string dir)
{
    return default_dirs[dir];
}

int help(object me)
{
    write(@HELP
指令格式 : go [方向]

这个指令可以让你向指定的方向移动。

HELP );
    return 1;
}
