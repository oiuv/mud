// Room: /d/xiakedao/xkroad3.c
// Modified by Java on Feb.14.1998

inherit BUILD_ROOM;

void create()
{
        set("short", "平原小路");
        set("long", @LONG
你走在珠江三角洲的平原小路上。此处向称鱼米之乡，有花果之
都美誉，物产丰饶，民风淳朴。在这里隐居想必不错。
LONG );
        set("outdoors", "nanhai");
        set("exits", ([
                "north"   : "/d/foshan/southgate",
                "south"   : __DIR__"xkroad4",
        ]));
        set("max_room", 5);
        setup();
}

