
inherit ROOM;

void create()
{
        set("short", "空地");
        set("long", @LONG
这是终南山山腰处的一块空地，地势平坦。北面一条小路
直攀山璧而上，通往是终南山主峰。南边和西边是一大片密林，
只闻阵阵琴声自林中传出。往北是一条山路。往南和西各有一
条小径。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "west"     : __DIR__"shulin5",
                "south"    : __DIR__"shulin4",
                "northup"  : __DIR__"shanlu1",
        ]));

        setup();
        replace_program(ROOM);
}
