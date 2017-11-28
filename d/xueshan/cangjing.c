inherit ROOM;

void create()
{
        set("short", "藏经阁");
        set("long", @LONG
这里是大轮寺的藏经之处。书架上林林总总都是梵文典籍。
可是你一个字也看不懂。
LONG);
        set("exits", ([
                "south" : __DIR__"dating",
        ]));
        setup();
        replace_program(ROOM);
}
