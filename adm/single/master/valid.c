/**
 * 权限控制apply方法
 * 返回１为允许，返回０为拒绝
 */
nosave int DEBUG = 0;

// controls the use of the bind() efun
int valid_bind(object binder, object old_owner, object new_owner)
{
    object ob;

    if(DEBUG){
        debug_message("[MASTER_OB]->valid_bind():" + file_name(binder) + "!");
        debug_message("([old : " + file_name(old_owner) + ", new : " + file_name(new_owner) + "])");
    }

    if (ob = find_object(SECURITY_D))
        return (int)ob->valid_bind(binder, old_owner, new_owner);

    return 1;
}

// Each of the database efunctions calls valid_database() prior to executing.
mixed valid_database(object caller, string func, mixed *info)
{
    if(DEBUG){
        debug_message("[MASTER_OB]->valid_database():");
        debug_message("([caller : " + file_name(caller) + ", func : " + func + "])");
    }
    if (func == "connect")
        return "secret"; // mysql数据库密码
    else
        return 1;
}

// valid_hide: controls the use of the set_hide() efun, to hide objects or
// see hidden objects
int valid_hide(object who)
{
    if(DEBUG)
        debug_message("[MASTER_OB]->valid_hide():" + file_name(who) + "!");
    return 1;
}

// valid_link: controls use of the link() efun for creating hard links
// between paths
int valid_link(string original, string reference)
{
    if(DEBUG)
        debug_message("[MASTER_OB]->valid_link():" + original + "-" + reference + "!");
    return 0;
}

// valid_object: controls whether an object loaded by the driver should exist
int valid_object(object ob)
{
    if(DEBUG)
        debug_message("[MASTER_OB]->valid_object():" + file_name(ob) + "!");
    return (! clonep(ob)) || inherits(F_MOVE, ob);
}

// valid_override: controls which simul_efuns may be overridden with
// efun:: prefix and which may not.  This function is only called at
// object compile-time
int valid_override(string file, string name, string main_file)
{
    if(DEBUG)
        debug_message("[MASTER_OB]->valid_override():" + file + "(" + name + ")!");

    // simul_efun can override any simul_efun by Annihilator
    if (file == SIMUL_EFUN_OB || file == MASTER_OB)
        return 1;

    // Must use the move() defined in F_MOVE.
    if ((name == "move_object") && file != F_MOVE && file != F_COMMAND)
        return 0;

    if ((name == "destruct") && ! sscanf(file, "/adm/single/simul_efun/%s", file))
        return 0;

    //  may also wish to protect destruct, shutdown, snoop, and exec.
    return 1;
}

// valid_read: read privileges; called exactly the same as valid_write()
int valid_read(string file, mixed user, string func)
{
    object ob;
    if (DEBUG)
        debug_message("[MASTER_OB]->valid_read():" + file + "(" + func + ")");

    if (ob = find_object(SECURITY_D))
        return (int)ob->valid_read(file, user, func);

    return 1;
}

// valid_save_binary: controls whether an object can save a binary
//   image of itself to the specified "save binaries directory"
//   (see config file)
int valid_save_binary(string filename)
{
    if(DEBUG)
        debug_message("[MASTER_OB]->valid_save_binary():" + filename + "!");
    return 1;
}

// valid_seteuid: determines whether an object ob can become euid str
int valid_seteuid(object ob, string str)
{
    if(DEBUG){
        debug_message("[MASTER_OB]->valid_seteuid():");
        debug_message("([obj : " + file_name(ob) + ", euid : " + str + "])");
    }
    if (find_object(SECURITY_D))
        return (int)SECURITY_D->valid_seteuid( ob, str );
    return 1;
}

// valid_shadow: controls whether an object may be shadowed or not
int valid_shadow(object ob)
{
    object pre;

    if(DEBUG)
        debug_message("[MASTER_OB]->valid_shadow():" + file_name(ob) + "!");

    pre = previous_object();
    if (geteuid(pre) == ROOT_UID ||
        sscanf(file_name(pre), "/shadow/%*s"))
    {
        return 1;
    }

    log_file("shadow", sprintf("%O try to shadow %O failed.\n", pre, ob));
    return 0;
}

// valid_socket: controls access to socket efunctions
int valid_socket(object eff_user, string fun, mixed *info)
{
    if(DEBUG)
        debug_message("[MASTER_OB]->valid_socket():" + file_name(eff_user) + "(" + fun + ")");
    return 1;
}

// valid_write: write privileges; called with the file name, the object
//   initiating the call, and the function by which they called it.
int valid_write(string file, mixed user, string func)
{
    object ob;
    if(DEBUG)
        debug_message("[MASTER_OB]->valid_write():" + file + "(" + func + ")");
    if (ob = find_object(SECURITY_D))
        return (int)ob->valid_write(file, user, func);

    return 0;
}

/**
 * 以下apply已失效
 */

// valid_asm: controls whether or not an LPC->C compiled object can use asm {}
int valid_asm(string file)
{
    if(DEBUG)
        debug_message("[MASTER_OB]->valid_asm():" + file + "!");
    return 1;
}

// valid_compile: controls whether or not an file can be compiled
int valid_compile(string file)
{
    if(DEBUG)
        debug_message("[MASTER_OB]->valid_compile():" + file + "!");
    if (! find_object(VERSION_D))
        return 1;

    if (VERSION_D->is_release_server())
        return 1;

    return file_valid(file) == 1;
}
