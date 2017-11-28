inherit ROOM;

void create()
{
        set("short", "官道" );
        set("long", @LONG
你走在一条大官道上，两旁不时有人从你身边走过，西面
通向荆州，东边是一条小路。
LONG);
        set("outdoors", "jingzhou");
        set("exits", ([
  		"east" : __DIR__"road7",
  		"west" : __DIR__"guandao2",
	]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

