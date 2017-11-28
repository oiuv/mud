// config.c

#include <ansi.h>
#include <runtime_config.h>

inherit F_CLEAN_UP;

void write_config();
string trim(string str);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        string key;
        mixed val;
        object ob;
        mapping dbase;
        string *cfg;
        string remember;
        string msg;
        string affix;
        int len;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (! arg) arg = "";

        if (sscanf(arg, "-d %s", key) == 1)
        {
                key = trim(key);

                if (undefinedp(CONFIG_D->query(key)))
                {
                        write("现在配置中没有 " + key + " 这个参数。\n");
                        return 1;
                }

                CONFIG_D->delete(key);
                write("去掉了参数：" + key + "。\n");
                return 1;
        }

        if (sscanf(arg, "%s=%s", key, val) == 2)
        {
                // 去掉key/val两端的空格
                key = trim(key);
                val = trim(val);

                if ((len = strsrch(val, '#')) != -1)
                {
                        // 有尾注
                        affix = val[len..<1];
                        val = val[0..len - 1];
                } else
                        affix = 0;

                // 去掉""
                sscanf(val, "\"%s\"", val);
                if (strlen(val) < 1)
                {
                        write("你没有指明这个参数的值，如果需要删除的话请用 -d 选项。\n");      
                        return 1;
                }

                if (! undefinedp(CONFIG_D->query(key)) &&
                    intp(CONFIG_D->query(key)))
                        // 原先参数的值是整数
                        if (! sscanf(val, "%d", val))
                                write("注意：原先 " + key + " 使用的是整数值，现在类型变化了。\n");

                write(sprintf("重新设置了 %s 参数为 %O。\n", key, val));
                CONFIG_D->set(key, val);
                if (stringp(affix))
                        CONFIG_D->set_temp("affix/" + key, affix);

                return 1;
        }

        if (arg == "-w")
        {
                write_config();
                return 1;
        }

        if (arg == "-r")
        {
                // 重新读取配置
                write("重新读取运行中的配置参数。\n\n");
                if (objectp(ob = find_object(CONFIG_D)))
                {
                        destruct(ob);
                        call_other(CONFIG_D, "???");
                }
                return 1;
        }

        msg = "";
	msg += "Mud 名称：\t\t" + get_config(__MUD_NAME__) + "\n"; 
	msg += "网路地址名称伺服器埠号：" + get_config(__ADDR_SERVER_IP__) + "\n"; 
	msg += "Mudlib 路径：\t\t" + get_config(__MUD_LIB_DIR__) + "\n"; 
	msg += "MudOS 执行档路径：\t" + get_config(__BIN_DIR__) + "\n\n"; 

        dbase = CONFIG_D->query_entire_dbase();
        if (! mapp(dbase))
        {
                write(msg + "现在没有任何运行中的配置参数。\n");
                return 1;
        }

        msg += "现在系统的运行配置参数：\n";
        cfg = keys(dbase);
        cfg = filter_array(cfg, (: stringp($(dbase)[$1]) || intp($(dbase)[$1]) :));
        if (stringp(arg) && strlen(arg))
        {
                // 寻找匹配的参数
                cfg = filter_array(cfg, (: strsrch($1, $(arg)) != -1 :));
                if (! sizeof(cfg))
                {
                        write(msg + "现在没有任何可以和 " + arg +
                              " 匹配的配置参数。\n");
                        return 1;
                }
        }

        cfg = sort_array(cfg, 1);
        foreach (key in cfg)
        {
                if (stringp(remember = CONFIG_D->query_remember(key)))
                        msg += CYN + remember + NOR "\n";
                if (! stringp(affix = CONFIG_D->query_affix(key)))
                        affix = "";
                msg += sprintf("%-20s: " WHT "%-25O" NOR "%-15s\n",
                               key, dbase[key], CYN + affix + NOR);
        }
        msg += NOR;

	write(msg);
	return 1;
}

// 写回参数
void write_config()
{
	string *tmp, file;
        string line;
        string arg, value;
        string affix;
        mapping dbase;
        string *cfg;
        int len;
        int i;

        // 取当前所有的参数
        if (! mapp(dbase = CONFIG_D->query_entire_dbase()))
                dbase = ([ ]);
        cfg = keys(dbase);
        cfg = filter_array(cfg, (: stringp($(dbase)[$1]) || intp($(dbase)[$1]) :));

        // 读取配置文件
	file = read_file(CONFIG_D->query_config_file_name());
	if (! stringp(file))
                file = "";

        // 去掉"\r"保证和MSDOS的文件格式兼容
        file = replace_string(file, "\r", "");

	tmp = explode(file, "\n");

        // 去掉最后的空行
        while (sizeof(tmp) && tmp[sizeof(tmp) - 1] == "")
                tmp = tmp[0..<2];

        for (i = 0; i < sizeof(tmp); i++)
        {
                line = tmp[i];

                // 去掉行首的空格
                while (strlen(line) && line[0] == ' ') line = line[1..<1];
                if (line[0] == '#')
                        continue;

                if (line[0] == '&')
                {
                        // 被系统注释的
                        line = line[1..<1];
                        while (strlen(line) && line[0] == ' ') line = line[1..<1];
                }

                // 去掉#以后所有的字符
                len = strsrch(line, '#');
                if (len != -1)
                {
                        // 记录尾注
                        affix = line[len..<1];
                        line = line[0..len - 1];
                } else
                        affix = 0;

                if (! strlen(line))
                        continue;

                // 检查该行
                if (sscanf(line, "%s:%s", arg, value) != 2)
                        continue;

                // 去掉arg末尾的空格
                while ((len = strlen(arg)) > 0 && arg[len - 1] == ' ')
                        arg = arg[0..<2];

                // 更换该行
                value = dbase[arg];

                if (stringp(value))
                        line = sprintf("%s : %s", arg, value);
                else
                if (undefinedp(value) || ! intp(value))
                        line = "& " + line;
                else
                        line = sprintf("%s : %d", arg, value);

                cfg -= ({ arg });

                // 加上尾注
                if (stringp(affix))
                        line = sprintf("%-44s %s", line, affix);

                tmp[i] = line;
        }

        tmp += ({ "" });
        foreach (arg in cfg)
        {
                value = dbase[arg];

                if (stringp(value))
                        line = sprintf("%s : %s", arg, value);
                else
                if (intp(value))
                        line = sprintf("%s : %d", arg, value);
                else
                        continue;
                tmp += ({ line });
        }

        file = implode(tmp, "\n") + "\n";
        write_file(CONFIG_D->query_config_file_name(), file, 1);
        write("将参数写回到配置文件中。\n");
}

// 去掉str两端的空格
string trim(string str)
{
        int len;

        // 去掉str两端的空格
        while (str[0] == ' ') str = str[1..<1];
        while ((len = strlen(str) - 1) >= 0 && str[len] == ' ')
                str = str[0..<2];

        return str;
}

int help(object me)
{
write(@HELP
指令格式 : config [-r | -w] [配置项=值] [-d 配置项]

Show 出本 MUD 的 Startup Configuration 。如果不加参数则同时
显示出运行中的配置(/adm/etc/config)。

-r 可以重新读取运行中的配置。
-w 可以重新写入运行中的配置。
-d 可以去掉一个配置项。

HELP );
     return 1;
}
