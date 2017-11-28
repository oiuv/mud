inherit ROOM;

void create()
{
        set("short", "荆州茶僚");
	set("long", @LONG
这里是荆州的茶僚，过往的路人多半都在这里歇脚、补充
干粮，水袋，屋里正坐着些歇脚的人，或高声谈笑，或交头接
耳。你要想打听江湖掌故和谣言，这里是个好所在。
LONG);
	set("resource/water", 1);
	set("exits", ([
                "east" : __DIR__"nandajie1",
	]));
	set("objects", ([
                __DIR__"npc/afang" : 1,
	]));
	setup();
	replace_program(ROOM);
}

