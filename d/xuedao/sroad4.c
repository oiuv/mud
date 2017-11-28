inherit ROOM;

void create()
{
        set("short", "大雪山口");
        set("long", @LONG
这里已经到了藏边，大雪山的山口。大雪山又叫岷山，位
于川藏之间，由于山势高峻，山顶终年不化积雪故而得名。四
下毫无人迹，只有几只秃鹰在高处盘旋，俯视着茫茫雪山。
LONG);
        set("exits", ([
                "eastdown"  : __DIR__"sroad3",
                "westup"    : __DIR__"sroad5",
        ]));
        set("objects", ([
                "/clone/quarry/ying" : 2,
        ]));
        set("outdoors", "xuedao");
        setup();
	replace_program(ROOM);
}
