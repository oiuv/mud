#include <ansi.h>
inherit F_CLEAN_UP;

void print_r(mixed *arr);
void debug(string);
int help();

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
    mixed *arr;
    mixed *args;
    object ob, env = environment(me);

    if (!arg || !wizardp(me))
        return notify_fail("debug what???\n");
    /**
     * debug code here
     */
    args = explode(arg, " ");
    switch (args[0])
    {
    case "allocate":
#ifdef FLUFFOS
        arr = allocate(1 + random(10), (: $1 :));
        arr[0] = allocate(1 + random(10), (: $1 :));
        arr[0][0] = allocate(1 + random(10), (: $1 :));
        arr[0][0][0] = allocate(1 + random(10), (: $1 :));
        arr[0][0][0][0] = allocate(1 + random(10), (: $1 :));
#else
        arr = allocate(5);
#endif
        debug(arg);
        print_r(arr);
        break;

    case "call_out":
        debug("开始倒记时！");
        call_out("debug", 10, "倒记时10秒!");
        call_out("debug", 20, "倒记时20秒!");
        call_out("debug", 30, "倒记时30秒!");
        break;
    case "origin":
        debug("origin:" + origin());
        break;

    case "previous_object":
        debug("previous_object:" + previous_object());
        break;
    case "this_object":
        debug("this_object:" + file_name(this_object()));
        break;
    case "this_player":
        debug("this_player:" + file_name(this_player()));
        break;
    case "this_interactive":
        debug("this_interactive:" + file_name(this_interactive()));
        break;

    case "abs":
        debug("abs(-100)=" + abs(-100));
        break;
    case "base_name":
        debug("base_name:" + base_name(previous_object()));
        break;
    case "file_name":
        debug("file_name:" + file_name(previous_object()));
        break;
    case "debug_message":
        debug_message("void debug_message(string msg);");
        debug("debug_message:请打开debug.log查看结果 ^_^");
        break;
#ifdef FLUFFOS
    case "element_of":
        arr = ({1, 2, 3, 4, 5});
        debug("element_of(({1, 2, 3, 4, 5})) = " + element_of(arr));
        break;
#endif
    case "heart_beats":
        debug(arg);
        print_r(heart_beats()); // set_heart_beat()
        break;
    case "named_livings":
        debug(arg);
        print_r(named_livings()); // set_living_name()
        break;
    case "users":
        debug(arg);
        print_r(users());
        break;
    case "livings":
        debug(arg);
        print_r(livings()); // enable_commands()
        break;
    case "objects":
        debug(arg);
        print_r(objects());
        print_r(objects((: clonep :)));
        break;
    case "deep_inventory":
        debug(arg);
        print_r(deep_inventory(env));
        break;
    case "all_inventory":
        debug(arg);
        print_r(all_inventory(env));
        break;
    case "first_inventory":
        debug("first_inventory：" + file_name(first_inventory(env)));
        break;
    case "next_inventory":
        debug("next_inventory：" + file_name(next_inventory(me)));
        break;
    case "environment":
        debug("我的位置：" + file_name(env));
        break;
    case "children":
        debug(arg);
        print_r(children("/clone/user/user"));
        break;
    case "master":
        debug("MASTER_OB:" + file_name(master()));
        break;

    case "inherit_list":
        debug(arg);
        print_r(inherit_list(this_player()));
        break;
    case "deep_inherit_list":
        debug(arg);
        print_r(deep_inherit_list(this_player()));
        break;
    case "all_previous_objects":
        debug(arg);
        print_r(all_previous_objects());
        break;
    case "call_out_info":
        debug(arg);
        print_r(call_out_info());
        break;

    case "printf":
        printf("printf:%s\n", arg);
        break;
    case "shout":
        shout("shout() - sends a message to all living objects\n");
        debug("所有其他玩家都已收到一条消息");
        break;
#ifdef FLUFFOS
    case "real_time":
        debug("real_time:" + real_time());
        break;
#endif
    case "find_player":
        if (sizeof(args) == 2)
        {
            debug("find_player " + sprintf("Result ：%s", file_name(find_player(args[1])) + "!"));
        }
        else
        {
            debug("[Warning]参数格式：find_player 玩家id！");
        }
        break;
    case "find_living":
        if (sizeof(args) > 1)
        {
            sscanf(arg, "%s %s", args[0], args[1]);
            debug("find_living " + sprintf("%s - %s", args[1], file_name(find_living(args[1])) + "!"));
        }
        else
        {
            debug("[Warning]参数格式：find_living id！");
        }
        break;

    case "present":
        if (sizeof(args) > 1)
        {
            sscanf(arg, "%s %s", args[0], args[1]);
            ob = present(args[1], env);
            if (objectp(ob))
                debug("present " + sprintf("%s - %s", args[1], ob->query("name") + "!"));
            else if (objectp(ob = present(args[1], me)))
            {
                debug("present " + sprintf("%s - %s", args[1], ob->query("name") + "!"));
            }
            else
                debug(sprintf("DEBUG：%s - %s", args[1], "在当前环境未找到!"));
        }
        else
        {
            debug("[Warning]参数格式：present id！");
        }
        break;

    case "db_connect":
#ifdef __PACKAGE_DB__
        if (sizeof(args) >= 5)
        {
            mixed dbcon, dbrows, dbres;
            dbcon = db_connect(args[1], args[2], args[3]);
            debug("数据库连接结果：" + dbcon);
            if (intp(dbcon))
            {
                if (sizeof(args) == 6)
                    dbrows = db_exec(dbcon, "SELECT " + args[5] + " FROM " + args[4]);
                else
                    dbrows = db_exec(dbcon, "SELECT * FROM " + args[4]);
                debug("数据库查询结果：" + dbrows);
                if (intp(dbrows) && dbrows)
                {
                    for (int i = 1; i <= dbrows; i++)
                    {
                        dbres = db_fetch(dbcon, i);
                        for (int j = 0; j < sizeof(dbres); j++)
                        {
                            write(" | " + dbres[j]);
                        }
                        write(" |\n");
                    }
                }
                db_close(dbcon);
            }
        }
        else
        {
            debug("[Warning]参数格式：db_connect host db user table [field]");
        }
#else
        debug("该驱动不支持此efun T_T");
#endif
        break;
    default:
        debug(arg);
    }

    return 1;
}

int help()
{
    write(origin() + "\n");
    write(@HELP
efun测试指令,请使用 efun efun_name args
HELP
    );
    return 1;
}

// 数组打印 debug
varargs void print_r(mixed *arr, int step)
{
    int i, j;
    if (sizeof(arr))
    {
        write(YEL "({\n" NOR);

        for (i = 0; i < sizeof(arr); i++)
        {
            if (arrayp(arr[i]))
            {
                step++;
                for (j = 0; j < step; j++)
                {
                    write("    ");
                }
                write(i + " => ");
                print_r(arr[i], step);
                step--;
            }
            else
            {
                for (j = 0; j <= step; j++)
                {
                    write("    ");
                }
                write(i + " => " + arr[i] + "\n");
            }
        }

        for (j = 0; j < step; j++)
        {
            write("    ");
        }
        write(YEL "})\n" NOR);
    }
    else
    {
        write(YEL "({ })\n" NOR);
    }
}

void debug(string str)
{
    write(BRED "Debug:" + str + "\n" NOR);
}
