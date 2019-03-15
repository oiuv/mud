/**
 * master.c
 */
// #pragma optimize
// #pragma save_binary

#include <config.h>
#include <localtime.h>

#include "master/valid.c"

object connect()
{
    object login_ob;
    mixed err;

    err = catch(login_ob = new(LOGIN_OB));

    if (err)
    {
        write("现在有人正在修改使用者连线部份的程式，请待会再来。\n");
        //write(err);
        destruct(this_object());
    }
    return login_ob;
}

// compile_object: This is used for loading MudOS "virtual" objects.
// It should return the object the mudlib wishes to associate with the
// filename named by 'file'.  It should return 0 if no object is to be
// associated.
mixed compile_object(string file)
{
    object daemon;

    if (daemon = find_object(VIRTUAL_D))
        return daemon->compile_object(file);
    else
        return 0;
}

// This is called when there is a driver segmentation fault or a bus error,
// etc.  As it's STATIC_VAR_TAG it can't be called by anything but the driver (and
// master).
void crash(string error, object command_giver, object current_object)
{
#if INSTALL_CRASH_SAVE
    object ob;
    string dump_dir;
    string user;
    string flogin, fuser;
    mixed lt;
#endif
    mixed cmds;
    int i;

    efun::shout("系统核心发出一声惨叫：哇—哩—咧—\n");
    efun::shout("系统核心告诉你：要当机了，自己保重吧！\n");
    log_file("static/CRASHES", MUD_NAME + " crashed on: " + ctime(time()) +
             ", error: " + error + "\n");
    if (command_giver)
    {
        log_file("static/CRASHES",
                 sprintf("this_player: %O\n", command_giver));
        cmds = command_giver->query_commands();
        for (i = 0; i < sizeof(cmds); i++)
        {
            if (cmds[i][2] == command_giver) continue;
            log_file("static/CRASHES",
                     sprintf("%-15s  %2d %O\n", cmds[i][0], cmds[i][1], cmds[i][2]));
        }
        if (environment(command_giver))
            log_file("static/CRASHES",
                     sprintf("in where: %s(%s)。\n", environment(command_giver)->query("short"),
                             base_name(environment(command_giver))));
        log_file("static/CRASHES",
                 sprintf( "this_player: %O 。 end command (%s)\n", command_giver, command_giver->query_last_input()));
    }
    if (current_object)
        log_file("static/CRASHES",
                 sprintf( "this_object: %O\n", current_object));

#if INSTALL_CRASH_SAVE
    lt = localtime(time());
    lt[LT_MON]++;
    dump_dir = sprintf(DUMP_DIR "%d-%d-%d/", lt[LT_YEAR], lt[LT_MON], lt[LT_MDAY]);
    foreach (ob in users())
    {
        reset_eval_cost();

        // backup user data to dump
        user = geteuid(ob);
        if (! stringp(user))
                continue;
        flogin = "login/" + user[0..0] + "/" + user + __SAVE_EXTENSION__;
        fuser  = "user/"  + user[0..0] + "/" + user + __SAVE_EXTENSION__;
        if (file_size(DATA_DIR + flogin) > 0 &&
            file_size(DATA_DIR + fuser) > 0)
        {
            // exist in data, I will backup it to dump
            assure_file(dump_dir + flogin);
            assure_file(dump_dir + fuser);
            cp(DATA_DIR + flogin, dump_dir + flogin);
            cp(DATA_DIR + fuser,  dump_dir + fuser);
            log_file("static/dump",
                     sprintf("backup user(%s) to dump\n", user));
        }
        ob->save();
    }
#endif
}

// Function name:   update_file
// Description:     reads in a file, ignoring lines that begin with '#'
// Arguements:      file: a string that shows what file to read in.
// Return:          Array of nonblank lines that don't begin with '#'
// Note:            must be declared STATIC_VAR_TAG (else a security hole)
STATIC_FUNC_TAG string *update_file(string file)
{
    string *list;
    string str;
    int i;

    str = read_file(file);
    if (!str)
        return ({});

    list = explode(str, "\n");
    for (i = 0; i < sizeof(list); i++)
        if (list[i][0] == '#')
            list[i] = 0;

    list -= ({ 0 });
    return list;
}

// Function name:       epilog
// Return:              List of files to preload
string *epilog(int load_empty)
{
    string *items;

    items = update_file(CONFIG_DIR + "preload");
    return items;
}

// preload an object
void preload(string file)
{
    if (objectp(find_object(file)))
        return;

    if (file_size(file + ".c") == -1)
        return;

    catch(load_object(file));
}

// Write an error message into a log file. The error occured in the object
// 'file', giving the error message 'message'.
void log_error(string file, string message)
{
    //if (this_player(1)) efun::write("\n编译时段错误：" + message); else
    //if (this_player()) tell_object(this_player(), "\n编译时段错误：" + message);

    efun::write_file(LOG_DIR + "log", message);
}

// save_ed_setup and restore_ed_setup are called by the ed to maintain
// individual options settings. These functions are located in the master
// object so that the local admins can decide what strategy they want to use.
int save_ed_setup(object who, int code)
{
    string file;

    if (! intp(code))
        return 0;

    file = user_path(getuid(who)) + ".edrc";
    rm(file);
    return write_file(file, code + "");
}

// Retrieve the ed setup. No meaning to defend this file read from
// unauthorized access.
int retrieve_ed_setup(object who)
{
    string file;
        int code;

    file = user_path(getuid(who)) + ".edrc";
    if (file_size(file) <= 0)
        return 0;

    sscanf(read_file(file), "%d", code);
    return code;
}

// When an object is destructed, this function is called with every
// item in that room.  We get the chance to save users from being destructed.
void destruct_env_of(object ob)
{
    if (! userp(ob)) return;
    tell_object(ob, "你所存在的空间被毁灭了。\n");
    ob->move(VOID_OB);
}

// make_path_absolute: This is called by the driver to resolve path names in ed.
string make_path_absolute(string file)
{
    file = resolve_path((string)this_player()->query("cwd"), file);
    return file;
}

// called if a user connection is broken while in the editor; allows
// the mudlib to save the changes in an alternate file without modifying
// the original
string get_save_file_name(string fname)
{
    return fname + "." + time();
}

string get_root_uid()
{
    return ROOT_UID;
}

string get_bb_uid()
{
    return BACKBONE_UID;
}

string creator_file(string str)
{
    return (string)call_other(SIMUL_EFUN_OB, "creator_file", str);
}

string domain_file(string str)
{
    return (string)call_other(SIMUL_EFUN_OB, "domain_file", str);
}

string author_file(string str)
{
    return (string)call_other(SIMUL_EFUN_OB, "author_file", str);
}

// simulate the old behavior of the driver
string standard_trace(mapping error, int caught)
{
    int i, s;
    string res;
    object me;
    mixed *cmds;

    /* keep track of number of errors per object...if you're into that */

    res = (caught) ? "错误讯息被拦截：" : "";
    res = sprintf("%s\n执行时段错误：%s\n程式：%s 第 %i 行\n物件：%s\n",
                  res, error["error"],
                  error["program"], error["line"],
                  error["object"] ? file_name(error["object"]) : "0");

    if (! error["object"] && (me = this_player()))
    {
        res += sprintf("当前玩家：%s(%s) - %O  所在环境：%O\n",
                       me->name(1), me->query("id"), me, environment(me));
        cmds = me->query_commands();
        res += me->name(1) + "身上及四周的物品与所在的环境提供以下指令：\n";
        for(i = 0; i<sizeof(cmds); i++)
            res += sprintf("%-15s  %2d %O\n",
                           cmds[i][0], cmds[i][1], cmds[i][2]);

        res += sprintf("当前的命令：%O\n", me->query_last_input());
    }

    i = 0;
    s = sizeof(error["trace"]);
    if (! this_player(1) && this_player())
    {
        // filter error trace of messaged & chat command
        for (; i < s; i++)
        {
            string prog;
            prog = "/" + error["trace"][i]["program"];
            if (prog != MESSAGE_D + ".c" &&
                ! sscanf(prog, "/cmds/chat/%*s") &&
                prog != "/clone/user/chatter.c" &&
                prog != F_COMMAND)
                    break;
        }
    }

    for (; i < s; i++)
    {
        res = sprintf("%s呼叫来自：%s 的 %s() 第 %i 行，物件： %O\n",
                  res,
                      error["trace"][i]["program"],
                      error["trace"][i]["function"],
                      error["trace"][i]["line"],
                      error["trace"][i]["object"]);
    }
    return res;
}

// The mudlib runtime error handler.
string error_handler(mapping error, int caught)
{
    if (this_player(1))
    {
        this_player(1)->set_temp("error", error);
        tell_object(this_player(1), standard_trace(error, caught));
    } else
    if (this_player())
        tell_object(this_player(), standard_trace(error, caught));

    // whatever we return goes to the debug.log
    return standard_trace(error, caught);
}

string object_name(object ob)
{
    if (ob) return ob->name();
}

void create()
{
    debug_message("master_ob loaded successfully.");
}

void check_daemons()
{
    string *sp;
    int i;

    sp = epilog(0);
    if (! sp) return;

    for (i = 0; i < sizeof(sp); i++)
        if (stringp(sp[i])) preload(sp[i]);
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

// driver 启动测试: -fdebug
void flag(string str) {
    switch (str) {
        case "debug":
            DEBUG = 1;
            break;
        default:
            write("[MASTER_OB]->flag():The only supproted flag is 'debug', got '" + str + "'.\n");
    }
}
