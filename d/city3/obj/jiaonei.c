
#include <ansi.h>
inherit ROOM;
 
void create()
{
        set("short", "轿内");
        set("long",@LONG
你在轿里刚坐稳，快轿摇了摇，抬起来往前走了。你只觉的轿子
慢慢摇啊摇啊，也不知道走了多久，一路上老觉得昏昏欲睡......
LONG);   
	set("no_clean_up", 0);
        setup();
	replace_program(ROOM);
}
