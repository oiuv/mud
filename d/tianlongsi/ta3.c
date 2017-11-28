inherit ROOM;

void create()
{
        set("short", "舍利塔");
        set("long",@LONG
这是天龙三塔之一，建于唐初，年代久远。虽然塔身已经石迹斑驳，
但是仍然耸立挺拔，俨然是天龙寺百年威名的象征。
LONG );
        set("outdoors", "tianlongsi");
        set("exits", ([
                "east" : __DIR__"talin",
        ]));
	set("objects",([
                "/d/wudang/npc/guest" : 2,
        ]));
//        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
