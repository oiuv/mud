inherit ROOM;

void create()
{
        set("short", "塔林");
        set("long",@LONG
这是一片塔林。放眼望去，林林总总有不下百座高矮不一的石塔，这
些都是达官显贵们捐资修筑的，或是为了祈求菩萨保佑，或是为了还愿平
心。东西北三面各有一座高塔。
LONG );
        set("outdoors", "tianlongsi");
        set("exits", ([
                "south" : __DIR__"ta1",
		"west" : __DIR__"ta3",
		"east" : __DIR__"ta2",
                "north" : __DIR__"damen",
        ]));
	set("objects",([
                __DIR__"npc/saodiseng" : 1,
        ]));
//        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
