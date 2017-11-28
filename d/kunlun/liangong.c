inherit ROOM;

void create()
{
        set("short", "练功房");
        set("long", @LONG
这里是练功房，地下凌乱地放着几个蒲团，正中烧着几柱
香，轻烟袅袅升起。几位昆仑派弟子正盘膝坐在上面打坐。
LONG);
        set("exits", ([
                "south" : __DIR__"sanshengtang",
                "north" : __DIR__"xiuxishi",
                "east"  : __DIR__"chufang",
        ]));
        set("objects", ([
                "/d/village/obj/zhujian" : 2,
        ]));

        set("no_fight", 1);

        setup();
        replace_program(ROOM);
}
