// #include <ansi.h>
#include "master/crash.c"
#include "master/error.c"
#include "master/file.c"
#include "master/flag.c"
#include "master/include.c"
#include "master/object.c"
#include "master/parser.c"
#include "master/preload.c"
#include "master/uid.c"
#include "master/valid.c"

// 玩家连线入口方法，返回连线对象
private object connect(int port)
{
    object login_ob;
    mixed err;

    err = catch (login_ob = new(LOGIN_OB));

    if (err)
    {
        write("服务器维护中，请稍候……\n");
        destruct(this_object());
    }
    return login_ob;
}

private void create()
{
    debug_message("[" + ctime() + "]CORE_MASTER_OB->create()!");
}

/**
 * @brief get optional MSSP infos
 *
 */
// mapping get_mud_stats( void ) {};

/**
 * @brief ed()相关apply方法
 *
 */
// string get_save_file_name( string ) {};
// string make_path_absolute( string rel_path ) {};
// int retrieve_ed_setup( object user );
// int save_ed_setup( object user, int config );
