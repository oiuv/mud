inherit ROOM;

void create()
{
        set("short", "石壁小径");
        set("long", @LONG
这里道路骤陡，一线天光从石壁之间照射下来，只觉阴气
森森，寒意逼人。路旁又现一堆白骨，骸骨中光亮闪耀，竟是
许多宝石珠玉。
LONG);
        set("outdoors", "shenfeng");

        if (random(10) > 8)
        	set("objects", ([
			"/clone/money/gold" : 1,
			"/clone/fam/item/bixue" : 1,
        		__DIR__"obj/skeleton" : 1,
		]));

        set("exits", ([ 
		"south" : __DIR__"xiaojing1",
  		"west" : __DIR__"feixu1",
	]));

        setup();
        replace_program(ROOM);
}
