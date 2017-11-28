#include <ansi.h>
inherit ROOM;
 
int do_stuff(object ob);
 
void create()
{
        set("short", HIB "黑店" NOR);
        set("long", HIB @LONG

                      黑                店  

    屋里相当冷清，外面的浓雾还不时地从半开著的门缝飘进来，地面
上散著一些破旧的物品，不过光从外表已经无法分辨出那是些什麽东西
了。墙上刻著一些潦草的字体，墙角的一盏灯笼挣扎似地发出一阵阵微
弱的光芒，也始得那些字看来格外的诡异。


LONG NOR);
	set("exits", ([
		"west" : "/d/death/road1",
	]) );

	set("objects", ([
		__DIR__"npc/ghost": 1,
	]) );

	 set("no_fight", 1);
	 set("no_sleep_room", 1);

        setup();
        replace_program(ROOM);
}
