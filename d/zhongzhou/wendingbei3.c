inherit ROOM;

void create()
{
        set("short", "文定北街");
        set("long", @LONG
这是中州城文定北街，宽敞的街道让人不竟心情一畅。街
道的东面就是中州的巡捕房，你不竟加快步伐，看来这种地方
还是少去为妙。西面一座大房子，门口的两只石狮子朝你瞪着
眼睛。门口还有一只大鼓，原来这就是中州的县衙门。
LONG);

	set("outdoors", "zhongzhou");
        set("exits", ([
                "east" : __DIR__"xunbu",
                "south" : __DIR__"wendingbei2",
                "west" : __DIR__"yamen",
                "north" : __DIR__"wendingbei4",
        ]));

        set("objects",([
	        "/d/beijing/npc/old1" : 1,
	        "/d/beijing/npc/old2" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
