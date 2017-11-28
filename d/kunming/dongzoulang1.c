inherit ROOM;

void create()
{
        set("short",  "东走廊" );
        set("long", @LONG
这里是一条干净的走廊，从两面看去，可以欣赏到花园里
的风景，只见各种假山怪石，奇花异草，足见王府之气派。
LONG);
        set("exits", ([
                "west"   :__DIR__"dongzoulang",
                "east"   :__DIR__"xiangfan"
        ]));
        set("objects", ([
                "/d/zhongzhou/npc/jiading" : 1,
        ]));
        setup();
        replace_program(ROOM);         
}
