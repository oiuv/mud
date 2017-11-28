inherit ROOM;

void create()
{
        set("short", "青石大道");
        set("long", @LONG
这是条青石铺成的宽敞大道，每块青石都是长约八尺，宽
约三尺，甚是整齐。道旁是郁郁葱葱的松树林，不时可以看到
几只松鼠蹦蹦跳跳地跃向树林深处。往北望去，一座巨大的石
堡巍然耸立。
LONG);
        set("outdoors", "lingjiu");
        set("exits", ([
                "north" : __DIR__"dadao2",
                "westdown" : __DIR__"xianchou",
        ]));
        set("objects",([
                "/clone/quarry/song" : 1,
        ]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
