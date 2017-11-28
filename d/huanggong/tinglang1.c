// tinglang1.c 厅廊

inherit ROOM;

void create()
{
        set("short", "厅廊");
        set("long", @LONG
飞檐雕栏的厅廊.两边是喜人的花草,站在这儿,隐约听得到后宫里
嫔妃宫女们嬉笑的声音,宫里的人来来往往的,显得井井有条,看来宫里
的规矩挺严的.有几个官员神情紧张地站在这儿,等着皇上召见.
LONG
        );
        set("exits", ([
        "north" : __DIR__"shufang",
        "south" : __DIR__"tinglang2",
        ]));
        set("outdoors", "huangon");
        setup();
        replace_program(ROOM);
}
