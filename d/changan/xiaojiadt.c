//Room: xiaojiadt.c

inherit ROOM;

void create()
{
        set("short", "萧家大厅");
        set("long", @LONG
这间大厅很朴素，房中除了一个铁箱之外，竟是既无家具，又无摆
设，只是墙上挂着一幅巨大的工笔画，画中一座大城，山环水绕，还点
缀有亭台楼阁、园林人物，看来是江南的一处名城。
LONG);
        set("exits", ([ /* sizeof() == 3 */
        	"west" : __DIR__"xiaojia-qianyuan",
        	"north" : __DIR__"xiaojia-pianting",
        	"south" : __DIR__"xiaojia-sleep"
        ]));
        set("objects", ([
        	__DIR__"npc/yuanwai" : 1,
        ]) );

        set("NONPC",1);
	setup();
        replace_program(ROOM);
}
