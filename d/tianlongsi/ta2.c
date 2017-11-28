inherit ROOM;

void create()
{
        set("short", "舍利塔");
        set("long",@LONG
这是天龙三塔之一，建于唐初，年代久远。传说月圆之夜，在此塔之
下默许心愿，塔顶会出现圣光指点迷津，助你达成心愿。
LONG );
        set("outdoors", "tianlongsi");
        set("exits", ([
                "west" : __DIR__"talin",
        ]));
	set("objects",([
                "/d/wudang/npc/guest" : 2,
        ]));
//        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
