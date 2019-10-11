// help.c

// This include file is included by the help command (/cmds/usr/help).
// If you changed the structure of help docs, remember to update this file.

#define DEFAULT_EFUN_PATHS ({\
	"/doc/help/",\
	"/doc/skill/",\
	"/doc/efuns/",\
	"/doc/applies/",\
	})

#define DEFAULT_HELP_PATHS ({\
	"/help/", \
	})


inherit F_CLEAN_UP;

string *efun_search = DEFAULT_EFUN_PATHS;
string *help_search = DEFAULT_HELP_PATHS;

int main(object me, string arg)
{
	int i;
	string file/*, *search*/;

	// If no topic specified, give the topics.
	if( !arg ) {
                if (file_size(HELP_DIR + "/topics") > 0)
                {
		        me->start_more(color_filter(read_file(HELP_DIR + "/topics")));
                } else
                {
                        write("没能找到帮助主题。\n");
                }
		return 1;
	}

	seteuid(getuid());

	// Search the individual search path first.
	if( pointerp(help_search) ) {
		i = sizeof(help_search);
		while(i--) if( file_size(help_search[i] + arg)>0 ) {
			me->start_more(color_filter(read_file(help_search[i] + arg)));
			return 1;
		}
	}

	// Else, try if a command name is specified.
	if( stringp(file = me->find_command(arg)) ) {
		notify_fail("有这个指令存在，但是并没有详细的说明文件。\n");
		return file->help(me);
	}

	// Support efun/lfun help with same name as other topics such as
	// ed() and ed command.
	sscanf(arg, "%s()", arg);

	// Finally, search the default search paths.
	if( pointerp(efun_search) ) {
		i = sizeof(efun_search);
		while(i--) if( file_size(efun_search[i] + arg)>0 ) {
			me->start_more(color_filter(read_file(efun_search[i] + arg)));
			return 1;
		}
	}

	return notify_fail("没有针对这项主题的说明文件。\n");
}

int help(object me)
{
	write(@HELP
指令格式：help <主题>              例如：> help cmds
          help <函数名称>()        例如：> help call_out()

这个指令提供你针对某一主题的详细说明文件，若是不指定主题，则提供你有关
主题的文件。
HELP
	);
	return 1;
}
