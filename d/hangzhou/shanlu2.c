// shanlu2.c
// Date: Nov.1997 by Venus

inherit BUILD_ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
走在这条不是很宽的山路上，只见两旁峰峦秀丽，景色怡人。一
条小溪在路边潺潺流过，溪畔有一农家。山村小景，使人有退隐江湖
之意。南上便到了中天竺。北下就是下天竺。
LONG);
        set("exits", ([
            "southup"   : __DIR__"fajinsi",
            "northdown" : __DIR__"fajingsi",
        ]));
        set("objects", ([
            __DIR__"npc/honghua2" : 2,
        ]));
        set("outdoors", "hangzhou");
        set("max_room", 4);
        setup();
        replace_program(ROOM);
}

