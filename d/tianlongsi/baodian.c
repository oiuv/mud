inherit ROOM;

void create()
{
        set("short", "崇圣宝殿");
        set("long",@LONG
这是一座宽广的大殿，正面有一座高约二十余尺的佛祖宝像，通体金
光耀眼。座下香烟缭绕。大殿两旁树立两根檀木大柱，题有一联，云曰：
　　　　　　守口摄意身莫犯　　莫恼一切诸有情　
LONG );
        set("outdoors", "tianlongsi");
        set("exits", ([
                "north" : __DIR__"ta1",
	]));
        setup();
        replace_program(ROOM);
}
