// Room: /d/mingjiao/huangtulu2.c
// Date: Java 97/04/9

inherit ROOM;

void create()
{
	set("short", "黄土小路");
	set("long", @LONG
这里是茂密松林中的一条黄土小路。松林极密，四面都是蓝幽幽
的感觉，白白的冰雪反光耀眼。你来到一个山腰的危崖之边，前边有
一个小洞。
LONG );
	set("exits", ([
		"east"  : __DIR__"huangtulu1",
		"enter" : __DIR__"shandong",
	]));
	set("outdoors", "mingjiao");
        set("objects", ([
                __DIR__"npc/menwei1" : 4,
        ])); 
	setup();
}

int valid_leave(object me, string dir)
{
        me = this_player();

        if (dir == "enter" && 
            objectp(present("da han", environment(me))))
         	return notify_fail("大汉拦住你说：此处乃明教"
				   "重地，只有教主才能入内。\n");
        return ::valid_leave(me, dir);
}
