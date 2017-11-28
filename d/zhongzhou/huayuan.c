inherit ROOM;

void create()
{
        set("short", "小花园");
        set("long", @LONG
这是县太爷府前的小花园，花草树木，鸟语花香。好一个
悠闲的地方。透过一簇牡丹花，北面就是县太爷的府邸。西面
的厢房略微陈旧一点。可能是府内下人的屋子。
LONG);
	set("outdoors", "zhongzhou");

        set("exits", ([
                "west" : __DIR__"xiaren",
                "north" : __DIR__"taiyefu",
                "east" :__DIR__"zoulang", 
        ]));

        setup();
        replace_program(ROOM);
}

