inherit ROOM;

void create()
{
        set("short", "钟楼");
        set("long", @LONG
一座小巧而高耸的阁楼，用上好的桧木所建，有一股淡淡
的清香。楼上的铁钟净重一万八千斤，是当年相国寺高僧云游
天下，布施而成的。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"qianyuan",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
