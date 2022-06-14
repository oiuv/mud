/**
 * 权限控制apply方法
 * 返回１为允许，返回０为拒绝
 */
#include <mysql.h>

nosave int DEBUG = 0;

// controls the use of the bind() efun
int valid_bind(object binder, object old_owner, object new_owner)
{
    if (DEBUG)
    {
        debug_message("[CORE_MASTER_OB]->valid_bind()!");
        debug_message("([binder : " + binder + ", old_owner : " + old_owner + ", new_owner : " + new_owner + "])");
    }
    return 1;
}

// Each of the database efunctions calls valid_database() prior to executing.
mixed valid_database(object caller, string func, mixed *info)
{
    if (DEBUG)
    {
        debug_message("[CORE_MASTER_OB]->valid_database():");
        debug_message("([caller : " + caller + ", func : " + func + "])");
    }
    if (func == "connect")
        return DB_PASSWORD; // mysql数据库密码
    else
        return 1;
}

int valid_hide(object ob)
{
    if (DEBUG)
        debug_message("[CORE_MASTER_OB]->valid_hide():" + ob);
    return 1;
}

// The driver calls valid_link(from, to) in the master object from inside the link(from, to) efunction.
int valid_link(string from, string to)
{
    if (DEBUG)
    {
        debug_message("[CORE_MASTER_OB]->valid_link():");
        debug_message("([from : " + from + ", to : " + to + "])");
    }

    return 1;
}

// allows control over which objects can be loaded
int valid_object(object obj)
{
    if (DEBUG)
        debug_message("[CORE_MASTER_OB]->valid_object():" + obj);
    return 1;
}

// Add valid_override to master.c in order to control the use of the efun:: prefix.
int valid_override(string file, string efun_name, string main_file)
{
    if (DEBUG)
    {
        debug_message("[CORE_MASTER_OB]->valid_override()!");
        debug_message("([file : " + file + ", efun_name : " + efun_name + ", main_file : " + main_file + "])");
    }

    if (efun_name == "destruct")
        return 0;
    if (efun_name == "shutdown")
        return 0;
    if (efun_name == "snoop")
        return 0;
    if (efun_name == "exec")
        return 0;

    return 1;
}

// checks if a certain person has read permission on a file
int valid_read(string file, mixed user, string func)
{
    if (DEBUG)
        debug_message("[CORE_MASTER_OB]->valid_read():" + file + "(" + func + ")");
    return 1;
}

// controls whether or not an object can save its program
int valid_save_binary(string file)
{
    if (DEBUG)
        debug_message("[CORE_MASTER_OB]->valid_save_binary():" + file);
    return 1;
}

// The driver calls valid_seteuid(ob, euid) in the master object from inside the seteuid(euid) efunction.
int valid_seteuid(object obj, string euid)
{
    if (DEBUG)
    {
        debug_message("[CORE_MASTER_OB]->valid_seteuid():");
        debug_message("([obj : " + obj + ", euid : " + euid + "])");
    }
    return 1;
}

// controls which objects can be shadowed(with the shadow() efun)
int valid_shadow(object ob)
{
    if (DEBUG)
        debug_message("[CORE_MASTER_OB]->valid_shadow():" + ob);
#ifdef __PACKAGE_UIDS__
    if (getuid(ob) == ROOT_UID)
    {
        return 1; /* for test */
    }
#endif
    if (ob->query_prevent_shadow(previous_object()))
    {
        return 0;
    }
    return 1;
}

// protects the socket efunctions.
int valid_socket(object caller, string func, mixed *info)
{
    if (DEBUG)
        debug_message("[CORE_MASTER_OB]->valid_socket():" + caller + "(" + func + ")");
    return 1;
}

// checks if a certain person has write permission on a file
int valid_write(string file, mixed user, string func)
{
    if (DEBUG)
        debug_message("[CORE_MASTER_OB]->valid_write():" + file + "(" + func + ")");
    return 1;
}
