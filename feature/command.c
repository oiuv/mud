// command.c
// From ES2
// Modified by Xiang@XKX (12/15/95)
// Updated by Doing for HELL (2K)

// #pragma optimize

#include <command.h>
#include <dbase.h>
#include <origin.h>

// Let command path be static, thus we can make sure no one can get command
// path directly from restore_object().
STATIC_VAR_TAG string *path;

// Leave this to allow other objects can search your commands such as
// help, which...
string find_command(string verb)
{
        return (string)COMMAND_D->find_command(verb, path);
}

string remove_leading_space(string arg)
{
        int i;
        for (i = 0; i < strlen(arg); i++)
                if (arg[i..i] != " ")
                        return arg[i..strlen(arg)];
        return "";
}

// This is the add_action hook handling movement, commands, emotes and
// channels. Optimization is needed.
nomask int command_hook(string arg)
{
        string verb, file;
        object me;
        mapping para;

#ifdef PROFILE_COMMANDS
        int mem, utime, stime;
        mapping info;

        mem = memory_info();
        info = rusage();
        utime = info["utime"];
        stime = info["stime"];
#endif

        me = this_object();
        verb = query_verb();
        if ((verb = remove_leading_space(verb)) == "")
                return 0;

        para = me->query_entire_dbase();
        para = para["env"];
        if (mapp(para) && para["pure_say"] && ! me->is_direct_command())
        {
                // 不是做动作，而是说话
                if (stringp(file = find_command("say")) &&
                    call_other(file, "main", me, me->query_orginal_input()))
                        // 执行完毕说话的动作
                        return 1;
                else
                        // 无法说话
                        return 0;
        }

        if (! arg &&
           (environment() && stringp(environment()->query("exits/" + verb))) &&
           stringp(file = find_command("go")) &&
           call_other(file, "main", me, verb))
                ; else
        if (stringp(file = find_command(verb)) &&
            call_other(file, "main", me, arg))
                ; else
        if (me->is_in_prison())
        {
                return notify_fail("狱卒喝道：你老老实实的呆着别动！" +
                        appromix_time(me->query_time_to_leave(), 1) +
                        "放你出去！\n");
        } else
        if (EMOTE_D->do_emote(me, verb, arg))
                ; else
        if (CHANNEL_D->do_channel(me, verb, arg))
                ; else
        if (mapp(para) && para["auto_say"] &&
            query_fail_msg() == "什么？\n" &&
            stringp(file = find_command("say")) &&
            ! me->is_direct_command() &&
            call_other(file, "main", me, me->query_orginal_input()))
                ; else
                return 0;

#ifdef PROFILE_COMMANDS
        info = rusage();
        PROFILE_D->log_command(verb, memory_info() - mem, info["stime"] - stime,
                info["utime"] - utime);
#endif

        return 1;
}

private nomask void set_path(string *p)
{
        path = p;
}

string *query_path() { return path; }
mixed *query_commands() { return commands(); }

int force_me(string cmd)
{
        int ret;

        if (! is_root(previous_object()))
                return 0;

        ret = command(this_object()->process_input(cmd));
        if (objectp(this_object()) && ! in_input())
                this_object()->write_prompt();
        return ret;
}

STATIC_VAR_TAG int enabled = 0;

nomask void enable_player()
{
        object me;
        string *my_path;

        if (stringp(query("id")))
                set_living_name(query("id"));
        else
                set_living_name(query("name"));

        if (! enabled)
        {
	        enable_commands();
                enabled = 1;
 	        add_action("command_hook", "", 1);
        }

        me = this_object();
        if (! playerp(me) &&
            ! interactive(me) &&
            ! me->is_chatter())
                my_path = NPC_PATH;
        else
        switch (wizhood(me))
        {
        case "(admin)":
                my_path = ADM_PATH;
                enable_wizard();
                break;
        case "(arch)":
                my_path = ARC_PATH;
                enable_wizard();
                break;
        case "(wizard)":
                my_path = WIZ_PATH;
                enable_wizard();
                break;
        case "(apprentice)":
                my_path = APR_PATH;
                enable_wizard();
                break;
        case "(immortal)":
                my_path = IMM_PATH;
                enable_wizard();
                break;
        default:
                if (this_object()->is_in_prison())
                        my_path = PNE_PATH;
                else
                        my_path = PLR_PATH;
        }

        if (me->is_chatter())
                // remove skill cmds & usr cmds
                my_path -= ({ "/cmds/skill/", "/cmds/usr/" });

        set_path(my_path);
}

nomask void disable_player(string type)
{
//      object env;

        if (! is_root(previous_object()) &&
            previous_object() != this_object()) return;

        set("disable_type", type);
        if (enabled)
        {
                disable_commands();
                enabled = 0;
        }
}
