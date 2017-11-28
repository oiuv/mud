inherit ROOM;

void create()
{
        set("short",  "长江岸边" );
        set("long", @LONG
这里是长江北岸，江水在你身边哗哗的流淌，不时可以看
见有山木从上游漂来，在水中打了个圈，向下游漂去。
LONG);
        set("outdoors", "jingzhou");
        set("exits", ([
                "northup" : __DIR__"chibi3",
		"west" : __DIR__"chibi5",                
        ]));
        setup();
        replace_program(ROOM);
} 
