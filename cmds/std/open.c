// open.c

#include <room.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	mapping doors;
	string *dirs, dir;
	int i;

	if( !arg ) return notify_fail("你要打开什么？\n");

	doors = environment(me)->query_doors();
	if( mapp(doors) ) {
		dirs = keys(doors);
		if( member_array(arg, dirs)!=-1 ) dir = arg;
		else for(i=0; i<sizeof(dirs); i++)
			if( arg==doors[dirs[i]]["name"] || member_array(arg, doors[dirs[i]]["id"])!=-1 ) {
				dir = dirs[i];
				break;
			}
		if( !dir ) return notify_fail("你要打开什么？\n");
	
		if( environment(me)->open_door(dir) ) {
			message_vision("$N将" + doors[dir]["name"] + "打开。\n", me);
			return 1;
		}
	}

	return 0;
}

int help(object me)
{
        write(@HELP
指令格式 : open <door> 或 <方向>
 
这个指令可以让你打开门.
 
HELP
    );
    return 1;
}
