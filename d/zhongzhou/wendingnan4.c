inherit ROOM;

void create()
{
        set("short", "文定南街");
        set("long", @LONG
这是中州城文定南街，宽敞的街道让人不竟心情一畅。就
快到中州的南城门了。路边有一家驿站。
LONG);
	set("outdoors", "zhongzhou");

        set("exits", ([
                "south" : __DIR__"nanmeng",
                "west" : __DIR__ "shuyuan",
                "north" : __DIR__"wendingnan3",
                "east" : __DIR__"yizhan",
	]));

        setup();
        replace_program(ROOM);
}

