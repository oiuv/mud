/**
 * master.c
 */
#pragma optimize

#include "master/crash.c"
#include "master/ed.c"
#include "master/error.c"
#include "master/object.c"
#include "master/parse.c"
#include "master/preload.c"
#include "master/security.c"
#include "master/valid.c"

object connect(int port)
{
    object login_ob;
    mixed err;
    if (port == 5566)
    {
        set_encoding("GBK");
    }

    err = catch(login_ob = new(LOGIN_OB));

    if (err)
    {
        write("现在有人正在修改使用者连线部份的程序，请待会再来。\n");
        //write(err);
        destruct(this_object());
    }
    return login_ob;
}

// 可以在这里自定义不同文件的include目录
mixed get_include_path(string object_path)
{
    // debug_message("[MASTER_OB]->get_include_path():" + object_path);
    return ({":DEFAULT:"});
}

void create()
{
    debug_message("master_ob loaded successfully.");
}

// 是否直接运行BINARY，不调用文件。
int direct_run_binary(string file)
{
    object ob;
    object vob;

    if (sscanf(file, DATA_DIR "%*s"))
        // 如果是DATA下面的文件，不能直接运行BIN代码，
        // 需要进行常规的版本有效检查。
        return 0;

    if (objectp(ob = find_object(CONFIG_D)) &&
        objectp(vob = find_object(VERSION_D)))
    {
        // 找到了CONFIG_D，查看本地是否是版本发布站
        // 点，如果是，则查看是否是发布的源程序，是
        // 则返回否，表示需要检查BIN。
        return ob->query("release server") != "local" &&
               ! VERSION_D->is_need_release_source(file);
    }

    // 没有找到CONFIG_D && VERSION_D，不编译，直接运行
    // BIN代码。
    return 1;
}

// When an object is destructed, this function is called with every
// item in that room.  We get the chance to save users from being destructed.
void destruct_env_of(object ob)
{
    if (! userp(ob)) return;
    tell_object(ob, "你所存在的空间被毁灭了。\n");
    ob->move(VOID_OB);
}

// 参考文档：https://bbs.mud.ren/threads/423
mapping get_mud_stats()
{
    return ([
        /* 必需字段 (Required) */
        // "NAME": "炎黄群侠传",           // MUD服务器名称(FluffOS自动提供)
        // "PLAYERS": sprintf("%d", sizeof(users())),  // 当前在线玩家数量(FluffOS自动提供)
        // "UPTIME": sprintf("%d", uptime()),          // 服务器启动时间戳(FluffOS自动提供)

        /* 通用字段 (Generic) */
        "HOSTNAME": "mud.ren",          // 服务器主机名
        "PORT": "6666",                 // 主连接端口
        "CREATED": "2010-01-01",        // MUD创建日期
        "LANGUAGE": "Chinese",          // 主要使用语言
        "LOCATION": "China",            // 服务器地理位置
        "WEBSITE": "https://mud.ren",   // 官方网站地址

        /* 分类字段 (Categorization) */
        "FAMILY": "LPMud",              // MUD代码库家族
        "GENRE": "Wuxia",                // 游戏题材类型
        "GAMEPLAY": "Roleplaying",      // 主要游戏玩法

        /* 协议支持字段 (Protocols) */
        "ANSI": "1",                    // 支持ANSI颜色代码
        "UTF-8": "1",                   // 支持UTF-8编码
    ]);
}
