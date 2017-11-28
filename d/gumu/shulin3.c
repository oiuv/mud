
inherit ROOM;

void create()
{
        set("short", "小树林");
        set("long", @LONG
这里是树林的边缘，参天古树已经很稀少了。东面有一座
高山，隐约看见山间云雾缭绕中，似乎有什么廊檐的建筑。山
势缓和，但山上郁郁葱葱地栽满了树木。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "south" : __DIR__"caodi",
                "northeast" : __DIR__"shulin2",
        ]));

        setup();
        replace_program(ROOM);
}
