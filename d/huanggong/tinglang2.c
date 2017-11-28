// tinglang2.c 厅廊

inherit ROOM;

void create()
{
        set("short", "厅廊");
        set("long", @LONG
飞檐雕栏的厅廊.两边是喜人的花草,站在这儿,隐约听得到后宫里
嫔妃宫女们嬉笑的声音,宫里的人来来往往的,显得井井有条,看来宫里
的规矩挺严的.
LONG
        );
        set("exits", ([
			"north" : __DIR__"tinglang1",
			"south" : __DIR__"shanfang",
			"west" : __DIR__"tinglang3",
        ]));
        set("outdoors", "huangong");
        setup();
        replace_program(ROOM);
}
