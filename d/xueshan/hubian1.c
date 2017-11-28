inherit ROOM;

void create()
{
        set("short", "湖边小路");
        set("long", @LONG
这是圣湖边的小路。路侧的湖水极为清澈。阳光下映着白
顶雪山显出一片蓝幽幽的宁静。但是周围却是被极浓的雾气所
笼罩，使你的眼前一片朦胧，瞧不清四周。
LONG );
        set("outdoors", "xuedao");
        set("exits", ([
                "west" : __DIR__"shenghu",
                "east" : __DIR__"hubian2",
        ]));
        setup();
}
