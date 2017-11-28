inherit ROOM;

void create()
{
	set("short", "商家堡大门");
	set("long", @LONG
一座巨大的宅院映入你的眼帘，正对着你的是一扇朱漆铜钉
的大门，四周是近丈高的围墙。大门的上方横着一块匾，匾上写
着「商家堡」三个大字。
LONG);
	set("exits", ([
		"north"  : __DIR__"shang_qgc",
		"south"  : __DIR__"shang_road3",
	]));
        set("objects", ([
                CLASS_D("shang") + "/zhen" : 1,
                __DIR__"npc/shang2" : 2,
        ]));
        set("no_clean_up", 0);
        setup();
}

int valid_leave(object me, string dir)
{
        object zhen;

        if (dir != "north"
           || ! objectp(zhen = present("shang baozhen", this_object()))
           || (me->query("born_family") == "山东商家"
           && ! me->query("family/family_name")))
                return ::valid_leave(me, dir);

        return zhen->permit_pass(me, dir);
}
