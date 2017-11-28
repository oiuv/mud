inherit ROOM;

void create()
{
        set("short",  "小路" );
        set("long", @LONG
这是一条通向江边的小路，路十分的陡，走起来得小心一
点，四周静悄悄的，只闻的鸟儿歌唱的声音。
LONG);
        set("outdoors", "jingzhou");

        set("exits", ([
                "northup" : __DIR__"chibi1",
		"southdown" : __DIR__"chibi3",
        ]));

        setup();
        replace_program(ROOM);
} 
