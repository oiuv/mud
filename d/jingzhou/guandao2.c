inherit ROOM;

void create()
{
        set("short", "官道" );
        set("long", @LONG
你走在一条大官道上，两旁不时有人从你身边走过，可以
分辩出有几个是江湖中人。西面隐约可以看见荆州，东边和一
条小路相连。
LONG);
        set("outdoors", "jingzhou");
        set("exits", ([
  		"east" : __DIR__"guandao1",
  		"west" : __DIR__"guandao3",
	]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

