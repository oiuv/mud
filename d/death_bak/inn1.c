#include <ansi.h>
inherit ROOM;
 
int do_stuff(object ob);
 
void create()
{
        set("short", HIB "小店" NOR);
        set("long", HIB @LONG

                      小                店  

    你一进来就发现屋里异常的温暖，墙角壁炉里微弱的火光将你的影
子投射在对面的墙上。几个人影围在炉旁不知在讨论些什麽。屋内有几
张木桌、椅，墙上挂了几幅字画，一切看来非常的详和宁静，你几乎忘
了自己身在何处。


LONG NOR );
        set("exits", ([
                 "east" : "/d/death/road1",
        ]));
 
	set("objects", ([
		__DIR__"npc/ghost": 1,
	]) );

	 set("no_fight", 1);
	 set("no_sleep_room", 1);

        setup();
        replace_program(ROOM);
}

