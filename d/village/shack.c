// Room: /d/village/ehouse1.c

inherit ROOM;

void create()
{
        set("short", "民宅");
	set("long", @LONG
这是一间十分简陋，四壁漏风的小房子，屋子里连一张象样的床都没
有，只有一面门板上面铺着些干草。这屋子的主人一定是贫困潦倒，穷的
叮当响。
LONG );
        set("exits", ([ /* sizeof() == 1 */
            "south" :__DIR__"wexit",
        ]));

        set("objects", ([
            __DIR__"npc/poorman": 1
        ]));

        setup();
        replace_program(ROOM);
}
 
