// unset.c
#include <ansi.h>

inherit F_CLEAN_UP;

int help();

int main(object me, string arg)
{
	if( !arg || arg=="" ) return help();

	me->delete("env/" + arg);
        //if (arg == "show_map")
                //write(ESC+"[r"+TOBOT(50));
	write("Ok.\n");
	return 1;
}

int help()
{
	write(@TEXT
指令格式：unset <变数名>

这个指令让你删除环境变数的设定。

修改变数设定请用 unset 指令。
TEXT
	);
	return 1;
}
