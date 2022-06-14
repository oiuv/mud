/*****************************************************************************
Copyright: 2020, Mud.Ren
File name: virtual_d.c
Description: 虚拟对象守护进程
Author: xuefeng
Version: v1.0
*****************************************************************************/
// 虚拟环境功能
mixed compile_area(string file)
{
    string virtual;
    object ob;
    int x, y, z, m, n;

    n = strsrch(file, "/", -1);
    if (n < 1)
    {
        return 0;
    }

    virtual = file[0..n - 1];

    if (file_size(virtual + ".c") < 1)
    {
        return 0;
    }

    if ((m = sscanf(file[n + 1..], "%d,%d,%d", x, y, z)) != 3)
    {
        if ((m = sscanf(file[n + 1..], "%d,%d", x, y)) != 2)
        {
            return virtual->query_maze_room(file[n + 1..]);
        }
    }

    if (m == 2 && !(ob = new (virtual, x, y)))
    {
        return 0;
    }
    else if (m == 3 && !(ob = new (virtual, x, y, z)))
    {
        return 0;
    }

    return ob;
}
// 虚拟怪物功能，开发者可以覆盖功能
mixed compile_mob(string file)
{
    string *path, virtual;
    object ob;
    int n;

    path = explode(file, "/");
    n = sizeof(path) - 1;
    virtual = replace_string(file, "/" + path[n], "");

    if (file_size(virtual + ".c") < 1)
        return "对象不存在！";

    if (!(ob = new(virtual, atoi(path[n]))))
        return "编译失败！";

    return ob;
}
// 虚拟对象功能路由
mixed compile_object(string file)
{
#ifdef WORLD_DIR
    if (sscanf(file, WORLD_DIR + "%*s", file))
    {
        return call_other(VIRTUAL_D, "compile_area", file);
    }
#endif

#ifdef MOB_DIR
    if (sscanf(file, MOB_DIR + "%*s", file))
    {
        return call_other(VIRTUAL_D, "compile_mob", file);
    }
#endif

    if (!strsrch(file, CORE_DIR "world/area/"))
    {
        return compile_area(file);
    }

    // todo 开发者自己实现

    return 0;
}

string short()
{
    return "虚拟对象精灵(VIRTUAL_D)";
}
