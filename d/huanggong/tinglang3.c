// Room: /d/huanggon/tinglang3.c

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
        set("exits", ([ /* sizeof() == 2 */
			  "north" : __DIR__"qihedian",
			  "east" : __DIR__"tinglang2",
		]));
        set("no_clean_up", 0);
        set("outdoors", "huangong");

        setup();
        replace_program(ROOM);
}
